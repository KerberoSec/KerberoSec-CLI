# Permissions

**Points:** 100

**Description:** Can you read files in the root file?
Additional details will be available after launching your challenge instance.

## Solution 

Launch the instance then connect to the SSH server. Once connected to the server, navigate to the root directory using the command `cd /`, and then proceed to the challenge directory. Within this directory, you'll find a file named "metadata.json".
Display the content inside the file using `cat metadata.json`, there we can find the flag. 
