# Red Team Engagements

### Defining Scope and Objectives

- Clearly define client objectives or goals  
- Decide how focused the assessment will be, general internal/network pentest or focused adversary emulation  
- Clearly define the scope of the engagement

### Rules of Engagement

RoE are a legally binding outline of the client objectives and scope. The format and wording of the RoE 
are critical since it is a legally binding contract and sets clear expectations.

Standard sections you may see in an RoE:

| Section Name | Section Details |
|--------------|-----------------|
| Executive Summary| Overarching summary of all contents and authorization within RoE document |
| Purpose | Defines why the RoE document is used |
| References | Any references used throughout the RoE document (HIPAA, ISO, etc.) |
| Scope | Statement of the agreement to restrictions and guidelines |
| Definitions | Definitions of technical terms used throughout the RoE document |
| Rules of Engagement and Support Agreement | Defines obligations of both parties and general technical expectations of engagement conduct |
| Provisions | Define exceptions and additional information from the Rules of Engagement |
| Requirements, Restrictions, and Authority | Define specific expectations of the red team cell |
| Ground Rules | Define limitations of the red team cell's interactions |
| Resolution of Issues/Points of Contact | Contains all essential personnel involved in an engagement |
| Authorization | Statement of authorization for the engagement |
| Approval | Signatures from both parties approving all subsections of the preceding document |
| Appendix | Any further information from preceding subsections |

[Example of an RoE from redteam.guide](https://redteam.guide/docs/templates/roe_template/)

### Campaign Planning

Campaign planning uses the information acquired and planned from the client objectives and RoE and 
applies it to various plans and documents to identify how and what the red team will do.

An example campaign summary adapted from military operations documents:

| Type of Plan | Explanation of Plan | Plan Contents |
|--------------|---------------------|---------------|
| Engagement Plan | An overarching description of technical requirements of the red team. | CONOPS, Resource and Personnel Requirements, Timelines |
| Operations Plan | An expansion of the Engagement Plan. Goes further into specifics of each detail. | Operators, Known Information, Responsibilities, etc. |
| Mission Plan | The exact commands to run and execution time of the engagement. | Commands to run, Time Objectives, Responsible Operator, etc. |
| Remediation Plan | Defines how the engagement will proceed after the campaign is finished. | Report, Remediation consultation, etc. |

[redteam.guide example of a campaign plan](https://redteam.guide/docs/checklists/red-team-checklist/)

### Engagement Documentation

Engagement documentation is an extension of campaign planning

**Engagement Plan:**

| Component | Purpose |
|-----------|---------|
| CONOPS (Concept of Operations) | Non-technically written overview of how the red team meets client objectives and targets the client. |
| Resource plan | Includes timelines and information required for the red team to be successful: any resource requirements: personnel, hardware, cloud requirements. |

**Operations Plan:**

| Component | Purpose |
|-----------|---------|
| Personnel | Information on employee requirements. |
| Stopping conditions | How and why should the red team stop during the engagement. |
| RoE (optional) | - |
| Technical requirements | What knowledge will the red team need to be successful. |

**Mission Plan:**

| Component | Purpose |
|-----------|---------|
| Command playbooks (optional) | Exact commands and tools to run, including when, why, and how. Commonly seen in larger teams with many operators at varying skill levels. |
| Execution times | Times to begin stages of engagement. Can optionally include exact times to execute tools and commands. |
| Responsibilities/roles | Who does what, when. |

**Remediation Plan (optional):**

| Component | Purpose |
|-----------|---------|
| Report | Summary of engagement details and report of findings. |
| Remediation/consultation | How will the client remediate findings? It can be included in the report or discussed in a meeting between the client and the red team. |

### Concept of Operations (CONOPS)

CONOPS details a high-level overview of the proceedings of an engagement. It serves as a business/client
reference and a reference for the red cell to build from and extend to further campaign plans. It 
should be written from a semi-technical summary perspective

Outline of critical components:

- Client Name
- Service Provider
- Timeframe
- General Objectives/Phases
- Other Training Objectives (Exfiltration)
- High-level Tools/Techniques planned to be used
- Threat group to emulate (if any)

The key to writing and understanding a CONOPS is to provide just enough information to get a general 
understanding of all on-goings. The CONOPS should be easy to read and show clear definitions and points 
that readers can easily digest.

### Resource Plan

The resource plan extends the CONOPS, including specific details such as dates, knowledge required, etc.
It is written as bulleted lists of subsections

Example subsections:

- Header
    - Personnel writing
    - Dates
    - Customer
Engagement Dates
    - Reconnaissance Dates
    - Initial Compromise Dates
    - Post-Exploitation and Persistence Dates
    - Misc. Dates
- Knowledge Required (optional)
    - Reconnaissance
    - Initial Compromise
    - Post-Exploitation
- Resource Requirements
    - Personnel
    - Hardware
    - Cloud
    - Misc.

The document should be straight to the point and define what is needed

### Operations Plan

The operations plan is a document that provides specific details of the engagement and actions occuring. 
It expands on the current CONOPS and should include the majority of specific engagement information and 
uses bulleted lists and small sub-sections.

Example:

- Header
    - Personnel writing
    - Dates
    - Customer
- Halting/stopping conditions (can be placed in ROE depending on depth)
- Required/assigned personnel
- Specific TTPs and attacks planned
- Communications plan (Summarize how the red cell with communicate with other cells and the client; Email, vectr.io, Slack, etc.)
- Rules of Engagement (optional)

### The Mission Plan

A cell-specific document that details exact actions to be completed by operators

Minimum details to be included:

- Objectives
- Operators
- Exploits/Attacks
- Targets (users/machines/objectives)
- Execution plan variations

