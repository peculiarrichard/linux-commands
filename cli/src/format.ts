// Hand-rolled ANSI codes instead of a dependency like chalk — this CLI has
// zero runtime dependencies on purpose, and three escape sequences don't
// justify one.
export const bold = (text: string) => `\x1b[1m${text}\x1b[0m`;
export const dim = (text: string) => `\x1b[2m${text}\x1b[0m`;
export const accent = (text: string) => `\x1b[36m${text}\x1b[0m`;
