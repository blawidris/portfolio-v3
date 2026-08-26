// Test-only stand-in for the "server-only" package. Next.js's bundler
// aliases real "server-only" imports to a no-op when compiling the server
// graph (and to a throwing guard for the client graph); Vitest has no such
// distinction, so vitest.config.mts aliases "server-only" to this empty
// module for every test run instead.
export {}
