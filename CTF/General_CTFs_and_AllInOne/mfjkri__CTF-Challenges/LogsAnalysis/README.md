# LogsAnalysis | Difficulty: Easy

## Requirements:

- Use or write a simple program to read and filter the log contents.

---

## Steps:

1. I will be writing a `Python` program to read and filter the log file contents.

```python
import os
import re
from collections import Counter

auth_file = os.path.join("FILE_PATH_TO", "auth.log")
with open(auth_file, 'r') as logs:
    log_lines = [line.rstrip() for line in logs.readlines()]

    users = []

    # Read each log line and add the user account they're trying to hack into to the list: users
    for log in log_lines:
        if "Invalid user" in log:
            match = re.search(r"(?<=user )\w+", log)
            if match:
                users.append(match.group(0))

    # Create a Counter object to help us count reptitions and a Set object for only unique users
    users_counted = Counter(users)
    unique_users = set(users)
    users_with_counts = []

    # Count the number of reptitions for each user
    for unique_user in unique_users:
        counts = users_counted[unique_user]
        users_with_counts.append(
            {
                "user" : unique_user,
                "counts" : counts
            }
        )

    # Sort the list using the "counts" value as a comparator, reverse is True for descending order
    users_with_counts.sort(key=lambda a: a["counts"], reverse=True)

    # Print out the THIRD most repeated user
    third_most_repeated = users_with_counts[2]
    print(third_most_repeated["user"], third_most_repeated["counts"])
```

*[Image: Output]*
