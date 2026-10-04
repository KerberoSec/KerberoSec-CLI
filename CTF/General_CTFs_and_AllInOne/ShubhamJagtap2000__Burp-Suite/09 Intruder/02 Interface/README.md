# Intruder Interface

- Let's take a look at the Intruder interface:

  ![Screenshot (816)](https://user-images.githubusercontent.com/63872951/183261054-7be52122-93ec-472a-96c3-070911f7e8fb.png)

- The first view we get is a relatively sparse interface that allows us to choose our target. Assuming that we sent a request in from the `Proxy` (by using `Ctrl + I` or `right-clicking` and selecting **"Send to Intruder"**), this should already be populated for us.

- There are **four** other Intruder sub-tabs:

  - 1. **Positions** allows us to select an Attack Type (we will cover these in an upcoming task), as well as configure where in the request template we wish to insert our payloads.
  - 2. **Payloads** allows us to select values to insert into each of the positions we defined in the previous sub-tab. For example, we may choose to load items in from a wordlist to serve as payloads. How these get inserted into the template depends on the attack type we chose in the Positions tab. There are many payload types to choose from (anything from a simple wordlist to regexes based on responses from the server). The Payloads sub-tab also allows us to alter Intruder's behaviour with regards to payloads; for example, we can define pre-processing rules to apply to each payload (e.g. add a prefix or suffix, match and replace, or skip if the payload matches a defined regex).
  - 3. **Resource Pool** is not particularly useful to us in Burp Community. It allows us to divide our resources between tasks. Burp Pro would allow us to run various types of automated tasks in the background, which is where we may wish to manually allocate our available memory and processing power between these automated tasks and Intruder. Without access to these automated tasks, there is little point in using this, so we won't devote much time to it.
  - 4. **Options sub-tab**, The settings here apply primarily to how Burp handles results and how Burp handles the attack itself. For example, we can choose to flag requests that contain specified pieces of text or define how Burp responds to redirect (3xx) responses.

# Answer the questions below

1. Which section of the Options sub-tab allows you to control what information will be captured in the Intruder results?
```
Attack Results
```
2. In which Intruder sub-tab can we define the "Attack type" for our planned attack?
```
Positions
```
