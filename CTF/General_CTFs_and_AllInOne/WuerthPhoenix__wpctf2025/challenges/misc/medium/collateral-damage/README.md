# MISCELLANEOUS MEDIUM CHALLENGE

`Title`: (COL)LATERAL DAMAGE  
`Description`: Move laterally between technologies and infrastructures.  
`Challenge Narrative`: Our company (Megacorp) has enlisted your red teaming expertise to evaluate Opsie, our newly deployed AI chatbot designed to assist DevOps engineers.
During internal testing, concerns have surfaced: it seems our data scientists may have inadvertently fine-tuned Opsie on sensitive internal data, including the names of confidential Docker images and containers.
One of our DevOps engineers has even observed Opsie leaking this kind of information in its responses.
The specific Docker image in question is currently public for testing purposes, but it remains under active development and is not secure:
We want to ensure that other teams interacting with Opsie cannot easily extract or discover this sensitive detail.
We are also concerned about the potential attack chain that a threat actor could execute if they were to discover the Docker image.  

## Abstract
This challenge falls under the "miscellaneous" category and involves lateral movement and exploiting various technologies using different techniques.  
The starting point is a web application simulating an AI DevOps assistant (powered by *LangChain* and *Azure OpenAI* APIs).  
Participants must use prompt injection techniques to extract the name of a public Docker image hosted on *DockerHub*.  
Once this initial hurdle is overcome, participants will need to inspect both the image's manifest and its contents (by running it) to find *AWS* keys.  
From there, they must enumerate the AWS account using the obtained keys and exploit a vulnerable *Lambda function* to retrieve the flag.  

## Instructions   

This challenge consists of several infrastructure components:

- A web application to be launched as a container, with which participants will interact.

- A Docker container publicly hosted on Docker Hub.

- An AWS Lambda function deployed in the cloud.

To prepare the infrastructure, the following steps must be completed:  

As the first thing, you must deploy aws infrastructure.  
Move inside the `aws-infra` directory and launch the following command:  
 
```console
terraform init && terraform plan
```  

Review the plan, if you are ok with it, deploy the infrastructure:  
```console
terraform apply -auto-approve
```  

If everything goes well, terraform will return the lambda url as the output, something like:  
```console
https://kei5lf3hha3vagedgd4lkdaeoy0piwcy.lambda-url.eu-west-1.on.aws/
```  

Save this url as you will need it for the next stage.  

Now move to the `public-docker-image` directory and change the following inside the `Dockerfile`:  
```console
LAMBDA_URL=<FULL-LAMBDA-URL-FROM-PREVIOUS-STEP>
```  

Now you are ready to build the container and push it to DockerHub.  
Build:  
```console
docker build -t r3drun3/megacorp_uvbutglpol_lmctfwert:vxdgrft .
```  

```console
docker push r3drun3/megacorp_uvbutglpol_lmctfwert:vxdgrft
```  

The last step is to build and launch the Docker container for the web application.    
Before building it, you need to put a `.env` file inside the `ai` directory: this file will contain the required credentials and endpoints:  
```console
OPENAI_API_KEY=<OPEN-AI-API-KEY-HERE-NON-MANDATORY>
AZURE_OPENAI_ENDPOINT=<AZURE-OPEN-AI-ENDPOINT-HERE>
AZURE_DEPLOYMENT_NAME=o4-mini
AZURE_OPENAI_API_KEY=<AZURE-OPEN-AI-API-KEY-HERE>
```  

Now you can build the container:   

```console
sh build.sh
```  

Once you have the container image, you can run it like so (remember resource constraints!):  

```bash
docker run -d \
--name misc-medium-collateral-damage \
-p 3924:3924 \
--memory="512m" \
--cpus="1.0" \
wpctf2025-challenges:collateral-damage
```  

At this point, the web app will be exposed at http://localhost:3924.  

If you are stuck, follow the [*walktrough*](./walktrough/README.md)    

