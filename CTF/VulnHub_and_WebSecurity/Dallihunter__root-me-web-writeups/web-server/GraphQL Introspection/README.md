# GraphQL Introspection CTF Writeup

## Overview

This challenge was a GraphQL-based CTF focused on schema introspection, query enumeration, and exploiting an undocumented query to extract a hidden flag.

The application exposed a search functionality that allowed querying rockets by country, which revealed the use of a GraphQL API.

Example request:

```json
{
  "query": "{ rockets(country: \"France\") { name, country, is_active } }"
}
```

Response:

```json
{
  "data": {
    "rockets": [
      {
        "name": "Diamant",
        "country": "France",
        "is_active": 0
      }
    ]
  }
}
```

---

## Step 1: Identifying GraphQL & Introspection

The first step was confirming GraphQL usage and checking whether introspection was enabled.

```json
{
  "query": "{ __schema { types { name } } }"
}
```

The response confirmed introspection was enabled and exposed the available schema types.

Key types discovered:

* Rocket
* Query
* String
* Int
* Boolean
* IAmNotHere (custom type)

The presence of a suspicious custom type (`IAmNotHere`) indicated a potential hidden feature.

---

## Step 2: Exploring Schema Structure

Further introspection of the Query type revealed available entry points:

```json
{
  "query": "{ __type(name: \"Query\") { fields { name } } }"
}
```

Output:

* rockets
* IAmNotHere

This confirmed that `IAmNotHere` was not just a type, but also a query endpoint.

---

## Step 3: Discovering Query Arguments via Error Messages

Attempting to call the query directly resulted in a GraphQL validation error:

```json
{
  "errors": [
    {
      "message": "Field \"IAmNotHere\" argument \"very_long_id\" of type \"Int!\" is required, but it was not provided."
    }
  ]
}
```

This error revealed:

* The query requires a mandatory argument: `very_long_id`
* The argument type is `Int!` (non-null integer)

This is an example of error-based schema disclosure.

---

## Step 4: Query Structure Reconstruction

From introspection and errors, the query structure was reconstructed as:

```graphql
IAmNotHere(very_long_id: Int!): IAmNotHere
```

And its return type contained:

```graphql
type IAmNotHere {
  very_long_id: Int
  very_long_value: String
}
```

---

## Step 5: Enumerating Data via ID Brute Force

Since the argument appeared to be a numeric identifier, different values were tested sequentially.

Eventually, a valid ID returned meaningful data containing the flag inside `very_long_value`.

---

## Step 6: Flag Extraction

By iterating over possible IDs, a valid record was found and the hidden flag was revealed in the response.

---

## Key Takeaways

* GraphQL introspection can expose full schema structure if not disabled.
* Error messages can leak sensitive information about query arguments and types.
* Hidden queries may exist even if not documented.
* Predictable integer-based identifiers can lead to enumeration vulnerabilities.
* Security in GraphQL must enforce authorization at resolver level, not just API structure.

---

## Conclusion

This challenge demonstrated how combining introspection, error analysis, and ID enumeration can lead to discovering hidden API functionality and extracting sensitive data.
