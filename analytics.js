import * as Sentry from "@sentry/node"

export class Analytics {

    constructor() {
        Sentry.init({ dsn: process.env.SENTRY_DSN });
    }

    logQuery(matchData) {
        this.#captureEvent('query', 'log', matchData);
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