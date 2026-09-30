[TryHackMe: Benign Room](https://tryhackme.com/r/room/benign)

## TryHackMe: Benign

### Key Questions and Answers

- **Logs from March, 2022:** Go to the date range selector near the search button, choose "Since", find "March 1st", and apply. The total number of logs corresponds to 13,959.

- **Imposter Alert:** To find distinct usernames, use the following Splunk query:

  ```plaintext
  index=win_eventlogs | stats values(UserName)
  ```

  An impostor account, `Amel1a`, is identified by the substitution of an "i" with "1".

- **HR Department User Running Scheduled Tasks:** Filter by `ProcessName=schtasks.exe` to see users running scheduled tasks. Given the challenge details, the answer is `Chris.fort`.

- **HR Department User Executing System Process to Download Payload:** Using `certutil.exe` (identified via the lolbas-project.github.io), the relevant user is `haroon`.

- **System Process Used to Bypass Security:** `certutil.exe` was used to download a payload from the internet.

- **Execution Date of Malicious Binary:** The binary was executed on 2022-03-04.

- **Third-party Site for Malicious Payload:** The malicious payload was downloaded from `controlc.com`.

- **File Name from C2 Server:** The file saved on the host machine was named `benign.exe`.

- **Suspicious File Pattern:** The file contained the pattern `THM{KJ&*H^B0}`.

- **URL Connected by Infected Host:** The host connected to `https://controlc.com/548ab556`.

