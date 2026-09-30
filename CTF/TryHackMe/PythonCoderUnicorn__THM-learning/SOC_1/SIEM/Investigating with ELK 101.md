#Subscribers 
https://tryhackme.com/room/investigatingwithelk101

In this room, we will learn how to utilize the Kibana interface to search, filter, and create visualizations and dashboards, while investigating VPN logs for anomalies. This room also covers a brief overview of Elasticstack components and how they work together.

## incident handling scenario 

A US-based company **`CyberT`** has been monitoring the VPN logs of the employees, and the SOC team detected some anomalies in the VPN activities. Our task as SOC Analysts is to examine the VPN logs for January 2022 and identify the anomalies. Some of the key points to note before the investigation are:

- All VPN logs are being ingested into the index **`vpn_connections`**.
- The index contains the VPN logs for January 2022.
- A user **`Johny Brown`** was terminated on 1st January 2022.
- We observed failed connection attempts against some users that need to be investigated.

## ElasticStack overview

**Elastic stack**

Elastic stack is the collection of different open source components linked together to help users take the data from any source and in any format and perform a search, analyze and visualize the data in real-time.

**Elasticsearch**

Elasticsearch is a full-text search and analytics engine used to store JSON-formated documents. Elasticsearch is an important component used to store, analyze, perform correlation on the data, etc. Elasticsearch supports RESTFul API to interact with the data.  

**Logstash**

Logstash is a data processing engine used to take the data from different sources, apply the filter on it or normalize it, and then send it to the destination which could be Kibana or a listening port. A logstash configuration file is divided into three parts, as shown below.

The **input** part is where the user defines the source from which the data is being ingested. Logstash supports many input plugins as shown in the reference [https://www.elastic.co/guide/en/logstash/8.1/input-plugins.html](https://www.elastic.co/guide/en/logstash/8.1/input-plugins.html)[](https://www.elastic.co/guide/en/logstash/8.1/input-plugins.html)

The **filter** part is where the user specifies the filter options to normalize the log ingested above. Logstash supports many filter plugins as shown in the reference documentation [https://www.elastic.co/guide/en/logstash/8.1/filter-plugins.html](https://www.elastic.co/guide/en/logstash/8.1/filter-plugins.html)

The Output part is where the user wants the filtered data to send. It can be a listening port, Kibana Interface, elasticsearch database, a file, etc. Logstash supports many Output plugins as shown in the reference documentation [https://www.elastic.co/guide/en/logstash/8.1/output-plugins.html](https://www.elastic.co/guide/en/logstash/8.1/output-plugins.html)

**Beats**

Beats is a host-based agent known as Data-shippers that is used to ship/transfer data from the endpoints to elasticsearch. Each beat is a single-purpose agent that sends specific data to the elasticsearch. All available beats are shown below.

**Kibana**

Kibana is a web-based data visualization that works with elasticsearch to analyze, investigate and visualize the data stream in real-time. It allows the users to create multiple visualizations and dashboards for better visibility: more on Kibana in the following tasks.

```
Beats (data collection agent)
L Logstash (data I/O process)
   L Elastic search (index & store data)
     L Kibana  (analysis & visualization)
```

- Beats is a set of different data shipping agents used to collect data from multiple agents. Like Winlogbeat is used to collect windows event logs, Packetbeat collects network traffic flows.
- Logstash collects data from beats, ports or files, etc., parses/normalizes it into field value pairs, and stores them into elasticsearch.
- Elasticsearch acts as a database used to search and analyze the data.
- Kibana is responsible for displaying and visualizing the data stored in elasticsearch. The data stored in elasticseach can easily be shaped into different visualizations, time charts, infographics, etc., using Kibana.

## kibana overview 

As we already covered a brief intro of Kibana. In this room, we will explore different Kibana features while investigating the VPN logs. Kibana is an integral component of Elastic stack that is used to display, visualize and search logs. Some of the important tabs we will cover here are:

- Discover tab
- Visualization
- Dashboard

```
username: Analyst
password: analyst123

IP: 10.10.255.94
```

Kibana Discover tab is a place where analyst spends most of their time. This tab shows the ingested logs (also known as documents), the search bar, normalized fields, etc. Here analysts can perform the following tasks:

- Search for the logs
- Investigate anomalies
- Apply filter based on
    - search term
    - Time period

**Discover Tab**  

Discover tab within the Kibana interface contains the logs being ingested manually or in real-time, the time-chart, normalized fields, etc. Analysts use this tab mostly to search/investigate the logs using the search bar and filter options.

Kibana Discover tab is a place where analyst spends most of their time. This tab shows the ingested logs (also known as documents), the search bar, normalized fields, etc. Here analysts can perform the following tasks:

- Search for the logs
- Investigate anomalies
- Apply filter based on
    - search term
    - Time period

**Discover Tab**  

Discover tab within the Kibana interface contains the logs being ingested manually or in real-time, the time-chart, normalized fields, etc. Analysts use this tab mostly to search/investigate the logs using the search bar and filter options.

Quick Select

The **Quick Select tab** is another useful tab within the Kibana interface that provides multiple options to select from. The **Refresh, Every** option at the end will allow us to choose the time to refresh the logs continuously. If 5 seconds is set, the logs will refresh every 5 seconds automatically.

**Timeline**

The timeline pane provides an overview of the number of events that occurred for the time/date, as shown below. We can select the bar only to show the logs in that specified period. The count at the top left displays the number of documents/events it found in the selected time.

**Left Panel: Fields**

The left panel of the Kibana interface shows the list of the normalized fields it finds in the available documents/logs. Click on any field, and it will show the top 5 values and the percentage of the occurrence.

We can use these values to apply filters to them. Clicking on the + button will add a filter to show the logs containing this value, and the: button will apply the filter on this value to show the results that do not have this value.

**Add filter** option under the search bar allows us to apply a filter on the fields as shown below.

**Create Table**

By default, the documents are shown in raw form. We can click on any document and select important fields to create a table showing only those fields. This method reduces the noise and makes it more presentable and meaningful.

```
Select the index vpn_connections  and filter from 31st December 2021 to 2nd Feb 2022. How many hits are returned?

2861

Which IP address has the max number of connections?

238.163.231.224

Which user is responsible for max traffic?

james

Create a table with the fields IP, UserName, Source_Country and save.

Apply Filter on UserName Emanda; which SourceIP has max hits?

107.14.1.247

On 11th Jan, which IP caused the spike observed in the time chart?

172.201.60.191

How many connections were observed from IP 238.163.231.224, excluding the New York state?

31st December 2021 to 2nd Feb 2022
filter > source_ip: 238.163.231.224
filter > NOT source_state: New York
48

```

## KQL overview

**KQL (Kibana Query Language)** is a search query language used to search the ingested logs/documents in the elasticsearch. Apart from the KQL language, Kibana also supports **Lucene Query Language**. We can disable the KQL query as shown below.

In this task, we will be exploring KQL syntax. With KQL, we can search for the logs in two different ways.
- Free text search
- Field-based search

Free text search allows users to search for the logs based on the **text-only**. That means a simple search of the term `security` will return all the documents that contain this term, irrespective of the field.

```
Let us look at the index, which includes the VPN logs. One of the fields `Source_Country` has the list of countries from where the VPN connections originated, as shown below.

Let's search for the text **`United States`** in the search bar to return all the logs that contain this term regardless of the place or the field. This search returned 2304 hits, as shown below.
What if we only search for the term `United` Will it return any result?
It didn't return any result because KQL looks for the whole term/word in the documents.

KQL allows the wild card `*` to match parts of the term/word. Let's find out how to use this wild card in the search query.
Search Query: United*

We have used the wildcard with the term United to return all the results containing the term United and any other term. If we had logs with the term United NationsIt would also have returned those as a result of this wildcard.

Logical Operators (AND | OR | NOT)

KQL also allows users to utilize the logical operators in the search query. Let us see the examples below.

1- OR Operator

We will use the OR operator to show logs that contain either the United States or England.

Search Query: "United States"    OR     "England"

Here, we will use AND Operator to create a search that will return the logs that contain the terms "UNITED STATES" AND "Virginia."

Search Query: "United States" AND "Virginia"

Similarly, we can use NOT Operator to remove the particular term from the search results. This search query will show the logs from the United States, including all states but ignoring Florida.

Search Query: "United States" AND NOT ("Florida")

In the Field-based search, we will provide the field name and the value we are looking for in the logs. This search has a special syntax as FIELD : VALUE. It uses a colon : as a separator between the field and the value. Let's look at a few examples.

Search Query: Source_ip : 238.163.231.224 AND UserName : Suleman

Explanation: We are telling Kibana to display all the documents in which the field Source_ip contains the value 19.112.190.54 and UserName as Suleman 

To explore the other options of KQL, look at this official reference [https://www.elastic.co/guide/en/kibana/7.17/kuery-query.html]

```

```
Create a search query to filter out the logs from Source_Country as the United States and show logs from User James or Albert. How many records were returned?

Source_Country :"United States"  and UserName :"James" or UserName:"Albert" 
161

As User Johny Brown was terminated on 1st January 2022, create a search query to determine how many times a VPN connection was observed after his termination.

1

```

## creating visualizations

The visualization tab allows us to visualize the data in different forms like Table, Pie charts, Bar charts, etc. This visualization task will use multiple options this tab provides to create some simple presentable visualizations.

```
left menu > Visualize Library
```

Often, we require creating correlations between multiple fields. Dragging the required field in the middle will create a correlation tab in the visualization tab. Here we selected the Source_Country as the second field to show a correlation among the client Source_IP.

The most important step in creating these visualizations is to save them. Click on the **save Option** on the right side and fill in the descriptive values below. We can add these visualizations to the already existing dashboard, or we can create a new one as well.
Steps to take after creating Visualizations:
- Create a visualization and Click on the Save button at the top right corner.
- Add the title and description to the visualization.
- We can add the visualization to any existing Dashboard or a new dashboard.
- Click **Save and add to the library** when it's done.

```
Which user was observed with the greatest number of failed attempts?

simon

How many wrong VPN connection attempts were observed in January?

274
```

![[Pasted image 20250315123503.png]]

96 points

