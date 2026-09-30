# Lab 8: Version Control and Backups

#### What caused the merge conflict in the Git exercises you did?

The lines under COMMIT 2, that conflicted between the `master` branch and `dice` branch.

#### Why does Git require us to manually intervene in merge conflicts?

To decide which version of our changes will be in the final copy of our project.

#### In our exercise of making pull requests, why did we fork the repository before making a PR?

To make our own changes before pushing it to the fork then submitting a pull request.

#### What command would you use to sync a folder ~/Downloads/Linux_ISOs to the folder /usr/local/share/Calendar, while preserving file metadata? (hint: use rsync)

```bash
rsync -a ~/Downloads/Linux_ISOs/ /usr/local/share/Calendar/
```

#### How does rsync determine when to look for changes between files? Select from the following: (read up on how rsync works, and what makes it efficient!)

- A. By calculating the checksum of each file and comparing them.

- B. By comparing the entire contents of each file for any differences.

- C. By seeing if the ‘last modified’ timestamp of the files are different.

- D. By seeing if the ‘created’ timestamp of the files are different.

- E. By seeing if the permissions of the files are different.

C. By seeing if the ‘last modified’ timestamp of the files are different. [How `rsync` works](https://rsync.samba.org/how-rsync-works.html)

