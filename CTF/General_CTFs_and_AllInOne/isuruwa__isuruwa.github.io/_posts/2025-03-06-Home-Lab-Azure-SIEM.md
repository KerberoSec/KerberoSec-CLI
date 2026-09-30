---
title: Building a  Honeynet in Azure With Azure Sentinel (SIEM)
date: 2025-03-06
categories: [SOC, SIEM, LAB]
tags: [soc, siem, lab]     # TAG names should always be lowercase
image:
  path: https://i.ibb.co/WvgKYm1W/soc-lab-SIEM.jpg
---

In this guide, I'll walk you through setting up a honeypot, capturing real-world attack attempts, forwarding logs to a SIEM, visualizing attacker locations using **Microsoft Sentinel** and implementing automated security responses to detect and mitigate threats in real-time.

## **Step 1: Setting Up an Azure Environment**

###: Get an Azure Subscription

1.  Sign up for **[Azure Free Subscription](https://azure.microsoft.com/en-us/pricing/purchase-options/azure-account)**.
2.  If you're unable to get a free account, consider:
    - A pay-as-you-go subscription (monitor costs carefully).
3.  Log in to the **[Azure Portal](https://portal.azure.com/)**.

---

## **Step 2: Deploying a Honeypot (Azure Virtual Machine)**

###: Create a resource group

![1](https://i.ibb.co/S46hmvFt/1.png)
![2](https://i.ibb.co/k6wKDMQQ/2.png)
![3](https://i.ibb.co/1tWP0syN/3.png)

###: Create a Virtual Network

![4](https://i.ibb.co/bgZJcJGT/4.png)
![5](https://i.ibb.co/W4Q6tJPr/5.png)
![6](https://i.ibb.co/8DT6939P/6.png)
![7](https://i.ibb.co/yn9xY1CV/7.png)

###: Create a Windows 10 VM

1.  Select **Windows 10** as the operating system.
2.  Choose an affordable VM size to avoid high costs.
3.  Set up a **username and password** for remote access.
4.  Modify the **Network Security Group (NSG)** to allow **all inbound traffic**.
5.  Deploy the VM.

![8](https://i.ibb.co/nNTF7S3B/8.png)
![9](https://i.ibb.co/s9bVJW0g/9.png)

###: Disable Windows Firewall

Run `wf.msc` and turn off all profiles.

![win-1](https://i.ibb.co/Qvt3kfHP/win-1.png)
![win-3](https://i.ibb.co/XxL379vs/win-3.png)

---

## **Step 3: Monitoring logs in Event Viewer**

###: Capturing Failed Logins

Fail some login attempts when logging to windows VM.

Now login to the VM.

In event viewer  `(eventvwr.msc)` you can see the **failed** login attempts we made.

![win-4](https://i.ibb.co/prhhMcp6/win-4.png)

Navigate to **Windows Logs > Security** to analyze failed login attempts (**Event ID 4625**).

![win-5](https://i.ibb.co/hRBxcmHH/win-5.png)

---

## **Step 4: Forwarding Logs to Microsoft Sentinel**

###: Set Up Log Analytics Workspace (LAW)

In **Azure**, create a **Log Analytics Workspace**.

![17](https://i.ibb.co/Y47jKTrH/17.png)

Deploy **Microsoft Sentinel** and link it to the LAW.

![18](https://i.ibb.co/zTHFwQHr/18.png)

Enable the **Windows Security Events via AMA** connector.

![20](https://i.ibb.co/ymg0BcVB/20.png)

Set up a **Data Collection Rule (DCR)** to send logs from the VM.

![22](https://i.ibb.co/pvyNtcsp/22.png)

## Step 5: Querying Logs with KQL

Once logs are collected in **Microsoft Sentinel**, we can analyze them using **Kusto Query Language (KQL)** to extract valuable insights.

###: Retrieving Failed Login Attempts

```kql
SecurityEvent
| where EventID == 4625
| order by TimeGenerated desc
```

This command retrieves all failed login attempts in descending order of time.

![38](https://i.ibb.co/67yq2N3Z/38.png)

---

###: Filtering by Specific Account Name

```kql
SecurityEvent
| where EventID == 4625
| where Account == "\\ADMINISTRATOR"
| order by TimeGenerated desc
```

This query isolates failed login attempts targeting the `\ADMINISTRATOR` account in descending order.

![35](https://i.ibb.co/Zp4xrVZ5/35.png)

###: Identifying Top Attacking IPs

```kql
SecurityEvent
| where EventID == 4625
| summarize Count = count() by IpAddress
| order by Count desc
```

This helps identify which IP addresses are attempting the most failed logins.

![36](https://i.ibb.co/XkV83Ncs/36.png)

###: Detecting Brute-Force Attacks (Multiple Failures in a Short Time Frame)

```kql
SecurityEvent
| where EventID == 4625
| summarize FailedAttempts = count() by bin(TimeGenerated, 10m), IpAddress
| order by FailedAttempts desc
```

This groups failed login attempts by **10-minute intervals**, helping detect brute-force attack patterns.

![37](https://i.ibb.co/27JHFh7h/37.png)

![39](https://i.ibb.co/9kj8FHrR/39.png)

---

## **Step 5: Enhancing Logs with Geolocation Data**

###: Importing GeoIP Data for Better Analysis

1.  Download **geoip-summarized.csv** (contains IP-to-location mapping).
2.  Upload the file as a **Sentinel Watchlist**:
    - **Watchlist Name:** `geoip`
    - **Search Key:** `network`
3.  Wait for full import (~54,000 records).

![29](https://i.ibb.co/FbfQtnNF/29.png)

###: Enhancing logs with Locations

```kql
let GeoIPDB_FULL = _GetWatchlist("geoip");
let WindowsEvents = SecurityEvent
    | where EventID == 4625
    | order by TimeGenerated desc
    | evaluate ipv4_lookup(GeoIPDB_FULL, IpAddress, network);
WindowsEvents
```

This enriches log data by mapping attacker IP addresses to real-world locations.

![40](https://i.ibb.co/23sF09TN/40.png)

---

## **Step 6: Creating a Visual Attack Map in Sentinel**

###: Building the Attack Visualization

1.  Open **Sentinel > Workbooks**.
2.  Create a new **Workbook** and enter the advanced editor.
3.  Paste the JSON code for the attack map.

```json
{
	"type": 3,
	"content": {
	"version": "KqlItem/1.0",
	"query": "let GeoIPDB_FULL = _GetWatchlist(\"geoip\");\nlet WindowsEvents = SecurityEvent;\nWindowsEvents | where EventID == 4625\n| order by TimeGenerated desc\n| evaluate ipv4_lookup(GeoIPDB_FULL, IpAddress, network)\n| summarize FailureCount = count() by IpAddress, latitude, longitude, cityname, countryname\n| project FailureCount, AttackerIp = IpAddress, latitude, longitude, city = cityname, country = countryname,\nfriendly_location = strcat(cityname, \" (\", countryname, \")\");",
	"size": 3,
	"timeContext": {
		"durationMs": 2592000000
	},
	"queryType": 0,
	"resourceType": "microsoft.operationalinsights/workspaces",
	"visualization": "map",
	"mapSettings": {
		"locInfo": "LatLong",
		"locInfoColumn": "countryname",
		"latitude": "latitude",
		"longitude": "longitude",
		"sizeSettings": "FailureCount",
		"sizeAggregation": "Sum",
		"opacity": 0.8,
		"labelSettings": "friendly_location",
		"legendMetric": "FailureCount",
		"legendAggregation": "Sum",
		"itemColorSettings": {
		"nodeColorField": "FailureCount",
		"colorAggregation": "Sum",
		"type": "heatmap",
		"heatmapPalette": "greenRed"
		}
	}
	},
	"name": "query - 0"
}
```

4.  Save it as **Win-Attack-Map**.
5.  Customize map settings for a better view.

![30](https://i.ibb.co/7tfTXr43/30.png)

![31](https://i.ibb.co/chMCYLsV/31.png)

![32](https://i.ibb.co/99nGwM7L/32.png)

###: Observing the Attack Trends

- The attack map plots incoming failed logins by location.
- Patterns emerge, identifying high-activity attack regions.
- This visualization provides valuable insights into global cyber threats.

![41](https://i.ibb.co/yFjnwSps/41.png)

---

## **Step 7: Automating Security Responses**

###: Configuring Sentinel Alerts

Automating alert mechanisms in **Microsoft Sentinel** ensures a swift response to potential security threats.

### **1. Create an Alert Rule in Microsoft Sentinel**

- Go to **Microsoft Sentinel** in the **Azure Portal**.
- Navigate to **Analytics** > **Create a New Rule**.
- Choose **Scheduled Query Rule** and configure:
  - **Rule Name:** “Multiple Failed Logins Alert”
  - **Query:**

```kql
SecurityEvent
| where EventId == 4625
| summarize FailedAttempts = count() by bin(TimeGenerated, 10m), IpAddress
| where FailedAttempts > 5

```

- **Trigger:** When more than 5 failed login attempts occur from the same IP .
- **Severity:** Set to Medium or High based on your security policy.
- **Action:** Select **Create an Incident**.

This alert helps detect brute-force login attempts, allowing security teams to take action before a successful compromise.

![49](https://i.ibb.co/2097D157/49.png)

### **2. Set Up an Automated Playbook to Send Emails**

~~This can't be done with a azure Free trial subscription.~~

To send an email when this alert is triggered, use **Azure Logic Apps** to create an automated Playbook.

1.  In **Microsoft Sentinel**, go to **Automation** > **Playbooks**.
2.  Click **Create a Playbook**.
3.  Select **Blank Logic App**.
4.  Choose **When an alert is triggered in Microsoft Sentinel** as the trigger.
5.  Add an **Office 365 Outlook** or **SendGrid Email** action:
    - Select **Send an email (V2)**.
    - Configure:
      - **To:** Security team email (e.g., `security@example.com`).
      - **Subject:** “Security Alert: Multiple Failed Login Attempts Detected!”
      - **Body:** Include dynamic alert details such as IP address and time.
6.  Save and enable the Playbook.

### **3. Link the Playbook to the Alert Rule**

1.  Go back to **Sentinel > Analytics**.
2.  Open the alert rule you created.
3.  Under **Automated response**, select **Add Playbook**.
4.  Choose the Playbook you created and save.

---

## **Conclusion**

### What We Achieved

- Built an **Azure-based Honeynet** to capture real attacks.
- Forwarded logs to **Microsoft Sentinel** for centralized monitoring.
- Used **GeoIP data** to track attacker locations.
- Created a **visual attack map** to analyze real-time threats.
- Implemented **automated alerts and incident response** mechanisms.

### Why This Matters

- This setup mirrors real-world **SOC environments**, making it invaluable for security professionals.
- Monitoring live attacks gives **hands-on threat analysis experience**.
- The skills learned here: **KQL queries, Sentinel integration, threat hunting**

### What's Next?

Who knows, I will be Back !

![illbeback](https://i.ibb.co/PG1P6JhZ/dont-be-in-cgecev.jpg)
