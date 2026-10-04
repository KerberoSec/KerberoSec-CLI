# Forbidden Paths

Also a straightforward challenge, we need to get past a filter that removes absolute paths. Knowing
where the website files are located, we can simply use a relative path to get to the root directory.

    ../../../../flag.txt

This correctly reads our flag!
