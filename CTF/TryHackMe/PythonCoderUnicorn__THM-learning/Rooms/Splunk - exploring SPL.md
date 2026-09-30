#FreeRoom #Splunk 
https://tryhackme.com/room/splunkexploringspl

Splunk is a powerful SIEM solution that provides the ability to search and explore machine data. **Search Processing Language (SPL)** is used to make the search more effective. It comprises various functions and commands used together to form complex yet effective search queries to get optimized results.

This room will dive deep into some key fundamentals of searching capability, like chaining SPL queries to construct simple to complex queries.

```
index='windowslogs'     All time

What is the name of the host in the Data Summary tab?

cyber-host
```

## searching & reporting 

```
search                 Last 24 hours 

search history

How to search                What to search
[documentation]              [ data summary ]

field sidebar
SELECTED FIELDS
	destination
	host
	source
	sourceip
	sourcetype
	user
INTERESTING FIELDS
	@version
	accountname
	accounttype
	application
	category
	channel
```

```
In the search History, what is the 7th search query in the list? (excluding your searches from today)

index=windowslogs | chart count(EventCode) by Image

In the left field panel, which Source IP has recorded max events?

index='windowslogs' sourceIP 
172.90.12.11

How many events are returned when we apply the time filter to display events on 04/15/2022 and Time from 08:05 AM to 08:06 AM?

134
```

## Splunk processing language

```
index='windowslogs' AccountName !=SYSTEM AND AccountName="James"

index='windowslogs' 

index='windowslogs' DestinationIp="172.18.39.6" DestinationPort="135"

What is the Source IP with highest count returned with this Search query?  
Search Query: index=windowslogs  Hostname="Salena.Adam" DestinationIp="172.18.38.5"

click on bar chart > source field > click name > source IP
172.90.12.11

```

## filtering the results 

Our network generates thousands of logs each minute, all ingesting into our SIEM solution. It becomes a daunting task to search for any anomaly without using filters. SPL allows us to use **Filters** to narrow down the result and only show the important events that we are interested in. We can add or remove certain data from the result using filters. The following commands are useful in applying filters to the search results.

```
index=windowslogs | fields + host + User + SourceIp

index=windowslogs | search Powershell

index=windowslogs

Dedup is the command used to remove duplicate fields from the search results. We often get the results with various fields getting the same results. These commands remove the duplicates to show the unique values.

index=windowslogs | table EventID User Image Hostname | dedup EventID

index=windowslogs | fields + host + User + SourceIp | rename User as Employees

index=windowslogs | table _time EventID Hostname SourceName | reverse

```

## SPL structure search 

SPL provides various commands to bring structure or order to the search results. These sorting commands like `head`, `tail`, and `sort` can be very useful during logs investigation. These ordering commands are explained below:

```
index=windowslogs | table EventID Hostname SourceName

index=windowslogs |table _time EventID Hostname SourceName |head 5

index=windowslogs |  table _time EventID Hostname SourceName | tail 5

index=windowslogs |  table _time EventID Hostname SourceName | sort Hostname

index=windowslogs | table _time EventID Hostname SourceName | reverse

```

## transformational commands

Transformational commands are those commands that change the result into a data structure from the field-value pairs. These commands simply transform specific values for each event into numerical values which can easily be utilized for statistical purposes or turn the results into visualizations. Searches that use these transforming commands are called transforming searches. Some of the most used transforming commands are explained below.

```
index=windowslogs | top limit=7 Image

index=windowslogs | rare limit=7 Image

index=windowslogs | highlight User, host, EventID, Image

# Stats commands
avg()
max()
min()
sum()
count()

index=windowslogs | chart count by User

index=windowslogs | timechart count by Image

```

