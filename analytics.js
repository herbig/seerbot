import * as Sentry from "@sentry/node"

export class Analytics {

    constructor() {
        Sentry.init({ dsn: process.env.SENTRY_DSN });
    }

    logHelp() {
        this.#captureEvent('help', 'log');
    }

    logQuery(matchData) {
        this.#captureEvent('query ' + matchData.queryCode, 'log', matchData);
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
            extra: data,
        });
    }
}