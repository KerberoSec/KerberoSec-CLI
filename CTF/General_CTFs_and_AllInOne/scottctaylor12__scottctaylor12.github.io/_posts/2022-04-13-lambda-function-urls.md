---
layout: post
title:  "AWS Lambda Function URLs for C2 Redirection"
description: Leverage the new AWS Lambda Function URL feature to expose a function to the Internet and redirect red team command and control traffic.  
tags: redteam, AWS, C2
---

## Overview

Using features of cloud providers for command and control (C2) is not a new concept. 
That said, AWS has recently released a new feature called [_Lambda Function URLs_](https://aws.amazon.com/blogs/aws/announcing-aws-lambda-function-urls-built-in-https-endpoints-for-single-function-microservices/) which allows developers to **easily** expose their Lambda functions to the internet with a HTTPS url and AWS-signed TLS certificate.
With a little coding and configuration, the AWS Lambda service and Lambda Function URL feature can make for a quick and easy C2 redirector.
My [Red Lambda](https://github.com/scottctaylor12/Red-Lambda/) GitHub project contains all the code and instructions for deploying this C2 infrastructure.

## Background

AWS has a service called Lambda which allows developers to write event-driven code which can be triggered through various events. 
Some triggers include other AWS service actions, a scheduled timer, or an HTTP(S) request. 
That last one sounds a bit interesting to red teamers! 
So how does one code a Lambda function and send HTTP(S) traffic to it?

## Developing a Lambda redirector

The concept of using lambda functions as a redirector is not new.
In fact, [@\_xpn\_](https://twitter.com/_xpn_) published a blog post back in early 2020 titled [AWS Lambda Redirector](https://blog.xpnsec.com/aws-lambda-redirector/) which covers exactly how one could accomplish this (highly recommend you read).
To summarize the blog post a bit, Cobalt Strike can send traffic in three primary ways via HTTPS:

1. HTTP body
2. HTTP Headers
3. HTTP query strings  

Therefore, the Lambda Function needs to read in each of these characteristics and forward them to the actual C2 server hidden behind the scenes. 
To break this down step by step, the Lambda function has to perform the following:

1. Read the full HTTP request sent from beacon, including any POST body.
2. Build a new HTTP request ensuring that the received HTTP headers, query string parameters, and POST body (if included) received from the beacon are used.
3. Forward the HTTP request to the team server and receive the response.
4. Add the received HTTP headers and body (if included) to the API gateway response.
5. Forward the response to beacon.

Unlike @\_xpn\_ who wrote their Lambda redirector in Go, I opted to write mine in Python.
The code used for the Lamda function can be found in my [Red Lambda](https://github.com/scottctaylor12/Red-Lambda/blob/main/lambda.py) GitHub project.

## Lambda Function URLs

With the lambda function written, we now need to start sending C2 traffic to it!
In \_xpn\_'s blog post, the AWS HTTP API Gateway service was used in conjunction with a Lambda function to expose it to the internet.
However, with the new _Lambda Function URL_ feature, developers do not need the AWS HTTP API Gateway and can directly expose the function to the internet.

As stated by AWS in their [announcement](https://aws.amazon.com/blogs/aws/announcing-aws-lambda-function-urls-built-in-https-endpoints-for-single-function-microservices/) about this new feature, _"sometimes all you need is a simple way to configure an HTTPS endpoint in front of your function without having to learn, configure, and operate additional services besides Lambda"_.
Lambda Function URLs can be assigned to any Lambda function to provide quick and easy internet access. 
A randomly generated URL will be assigned to the function with the following scheme: `https://<random-id>.lambda-url.<region>.on.aws`.
In addition, the TLS certificate is valid and signed by AWS themselves which helps blend in with normal traffic.
Below is a screenshot of the lambda function url in action with the TLS certificate information shown.

*[Image: lambda-url-test]*{:class="img-responsive"}

In this example, a lambda function is simply making another HTTP request to a server running the default apcahe web server page. However, the backend server can be anything such as a C2 server...

## Deployment

The diagram below shows what the C2 infrastructure looks like using a Lambda Function URL. 
With the ability to "magically" give internet access to a private Lambda function, the only resource exposed to the internet for defenders to find is the url. 
All other resources are hidden in a private VPC (virtual private cloud) which is great for OPSEC.

*[Image: red-lambda-aws-topology]*{:class="img-responsive"} 

To ease the implementation and deployment of this C2 infrastructure, I developed a [CloudFormation](https://aws.amazon.com/cloudformation/) template which is an infrastructure as code AWS service used to automatically deploy infrastructure. The cloudformation template sets up:

* VPC & Subnet 
* EC2 instance with SSM enabled
* Lambda Redirector 
* Lambda Function URL

A prerequisite to running CloudFormation is installing the [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) on your workstation. 
Additionally, a valid AWS API key is needed in order to authenticate to AWS using the aws-cli. 
Once this is setup on the workstation, deployment is done by running:

```aws cloudformation deploy --stackname <insert name> --template  /path/to/template.yml --capabilities CAPABILITY_NAMED_IAM```

This deployment process takes a few minutes to complete, so sip some tea and relax while it runs.
After running the CloudFormation template, the C2 framework still needs to be installed and configured on the EC2 instance.

## C2 over Lambda

To test this out with actual command and control, I setup [Mythic](https://github.com/its-a-feature/Mythic) written by [@its_a_feature_](https://twitter.com/its_a_feature_). 
There are numerous agents written for Mythic and I decided to use [Athena](https://github.com/MythicAgents/Athena) which is a .NET 6 cross-platform agent developed by [@checkymander](https://twitter.com/checkymander). 
When configuring the Athena payload in Mythic, I pointed the callback host to my Lambda Function URL as shown in the diagram below.

*[Image: mythic-configuration]*{:class="img-responsive"}

As mentioned previously, the lambda function is configured to read all HTTP requests and forward them to the actual Mythic C2 server behind the scenes.
Once downloaded and executed on my machine, the Athena agent successfully sent traffic through my lambda redirector and back to the Mythic server. Below is a screenshot of the successful C2 activity.

*[Image: athena-callback]*{:class-"img-responsive"}
