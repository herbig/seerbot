# Privacy Policy

The privacy policy and terms of service for Four Cores — covering both the app
and this Discord bot — are published at:

- **https://fourcores.gg/privacy**
- **https://fourcores.gg/tos**

Those pages are the authoritative versions; this file is only a pointer.

## Short version, for anyone reading the source

- The bot has **no database** and writes nothing to disk. Message text is read
  only to spot `(( ))` card queries, used to look up a card, and discarded.
- It does **not** read or record Discord user IDs, usernames, or server names.
- Usage and error events go to Sentry. They carry the command used and the
  **card the query resolved to** — never the text you typed. See the allowlist
  in [`analytics.js`](analytics.js).

Questions: michael@herbig.dev
