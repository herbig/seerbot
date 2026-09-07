import * as Sentry from "@sentry/node"

/**
 * Keys allowed to leave the process on a usage event.
 *
 * Usage events exist to answer "which cards get looked up, how", so they carry
 * the *resolved* card name and never the text the user typed. The filter lives
 * here rather than at the call sites so that a new caller cannot reintroduce
 * raw message content by accident — see https://fourcores.gg/privacy.
 */
const ALLOWED_EVENT_KEYS = ['queryCode', 'cardName', 'setCode', 'matched', 'ephemeral'];

/**
 * A set code is the one part of a query that reaches us as the user's own
 * text (whatever follows the `|`). Bound it to the shape of a real set code so
 * it cannot carry message content; anything else is reported as 'invalid'.
 */
const SET_CODE_PATTERN = /^[a-z0-9]{1,6}$/i;

function safeSetCode(setCode) {
    if (setCode === undefined) return undefined;
    return SET_CODE_PATTERN.test(setCode) ? setCode.toUpperCase() : 'invalid';
}

function pickAllowed(data) {
    if (!data) return data;

    const picked = {};
    for (const key of ALLOWED_EVENT_KEYS) {
        if (data[key] !== undefined) picked[key] = data[key];
    }
    return picked;
}

export class Analytics {

    constructor() {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            // The default `Http` and `Undici` integrations attach a breadcrumb for
            // every outbound request to every event, and discord.js REST URLs
            // embed channel and guild snowflakes — so events would end up
            // reporting Discord identifiers the bot itself never reads. Drop both.
            integrations: defaults =>
                defaults.filter(integration =>
                    integration.name !== 'Http' && integration.name !== 'Undici'),
        });
    }

    logHelp() {
        this.#captureEvent('help', 'log');
    }

    /**
     * Records an inline (( )) card lookup. Reports what the query resolved to,
     * not what was typed: `match.query` is deliberately left out.
     */
    logQuery(match) {
        this.#captureEvent('query ' + match.queryCode, 'log', {
            queryCode: match.queryCode,
            cardName: match.cardName,
            setCode: safeSetCode(match.setCode),
            matched: match.cardName !== undefined,
        });
    }

    logCommand(commandName, data) {
        this.#captureEvent('command ' + commandName, 'log', data);
    }

    logError(message, error) {
        this.#captureEvent(message, 'error', error);
    }

    // level options are 'error', 'warning', 'log', or 'info'
    #captureEvent(eventName, level, data) {
        if (process.env.NODE_ENV === 'dev') return;

        Sentry.captureEvent({
            message: eventName,
            level: level,
            // Error reports keep their full payload (a stack trace is the point);
            // usage events are reduced to the allowlist above.
            extra: level === 'error' ? data : pickAllowed(data),
        });
    }
}
