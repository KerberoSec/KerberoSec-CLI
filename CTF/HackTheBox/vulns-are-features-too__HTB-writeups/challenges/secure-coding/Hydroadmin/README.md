# Hydroadmin

## Exploit

In `exploit/solver.py`, we find that the attack is a **PIN bruteforce attack** against a **GraphQL** API.
Specifically, it's a **GraphQL Batching Attack** on the `verifyAccessPin` mutation method.

To learn more about the batching attack, check the following:
- [GraphQL Batching Attack: wallarm](https://lab.wallarm.com/graphql-batching-attack/)
- [Batching Client GraphQL Queries: Apollo GraphQL](https://www.apollographql.com/blog/batching-client-graphql-queries)

## Fix

Knowing this is a batching attack, we just need to disable batching.
In `/index.js` (at the root of the project), we find the database setup.

```js
// Create Apollo Server,
const server = new ApolloServer({
  ...armor.protect(),
  introspection: false,
  typeDefs,
  allowBatchedHttpRequests: true,
  resolvers
});
```

The fix is simply to set `allowBatchedHttpRequests: false`.
