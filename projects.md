---
layout: page
title: projects
permalink: /projects/
---

Resumes aren’t always the best place to capture the full scope of the projects I’ve worked on. My rule of thumb: if it doesn’t fit on one page, it doesn’t make the cut. That said, for most of the projects I’ve taken on, I’ve served as the primary engineer—collaborating directly with stakeholders to define requirements and deliver effective solutions


## Cloud
I've had the opportunity to build all sorts of useful bits in the cloud, mostly AWS. 


### IAM Tooling
I’ve had to write a lot of AWS IAM policies, and constantly digging through the AWS documentation to find available actions was time-consuming. To streamline the process, I built a static site that indexes all AWS IAM actions. I also included mappings between Terraform resources and the corresponding AWS actions, making it much faster to construct accurate and least-privilege policies.

I also created a Terraform module that simplifies the creation of IAM policies with read-only or write permissions for groups of AWS resource types. This is especially useful for defining scoped role policies required to run `terraform plan` or `terraform apply` securely and with least privilege

- [scrape_iam](https://rezen.github.io/scrape_iam/)
- [terraform-polly](https://github.com/rezen/terraform-polly)

### JIT AWS Role Sessions
The hosts in some datacenters used IAM users for interacting with AWS. Wanting to reduce the risk these static access keys with long lived durations presented I created a service built on AWS lambda that leveraged hosts existing PKI identity to vend short lived role sessions which could be used as proof of identity to assume AWS role identities just-in-time. This significantly reduced window of opportunity for an attacker if they accessed a machines AWS credentials.

- AWS Lambda
- Python
- Boto

        
### Rogue Device Detection in AWS for FedRAMP
As part of building out FedRamp we had a rogue device detection requirement for AWS. I architected & built out a workflow in AWS leveraging Cloudformation StackSets to configure EventBridge in all our org accounts & in every region to send EC2 started events to a central monitoring account EventBridge. From that monitoring account, the event get processed through a lambda which had permission to do cross account ec2:Describe* to verify the instance was in inventory which was tracked via a naming convention. Those details were then logged into a cloudwatch and then those were picked up by the internal alert systems.

- Cloudwatch
- EventBridge
- Cloudformation
- AWS Lambda


### Automated RDS Scanning
To meet compliance requirements at one organization, we needed to perform authenticated compliance scans of our AWS-hosted databases. Using Qualys for this was clunky and involved multiple manual steps. To eliminate manual processes, I designed and deployed an automated architecture using CloudFormation StackSets. This solution provisioned AWS Lambda functions into the same subnets as our RDS instances & would modify VPCs automatically to fix any connectivity issues. The Lambdas authenticated against the databases and ran compliance checks using InSpec, with results aggregated into a central S3 bucket in a designated account. For monitoring, I integrated the system with AWS-native Grafana dashboards.

- Terraform
- Inspec
- Ruby
- Cloudformation
- AWS Lambda
- S3
- Grafana
- SNS


### Cloudquery

## Security Tooling

### Automatator
While on a security team, one of our major challenges was consolidating data from various systems such as ZAP, Qualys, & Scout Suite and efficiently assigning remediation work to engineering teams. The problem broke down into three parts: Data consolidation, Interaction and filtering, Work creation and tracking. To gather data, I designed a Python-based spec for task definitions that deployed to either AWS Lambda or AWS ECS, depending on the task. Each task pulled data from a different source and stored it in S3, which was then ingested into MongoDB for analysis. I built a web application using Flask that allowed users to view and filter vulnerabilities, define JIRA templates, and create tasks based on selected issues. The app also tracked the status of linked JIRA tickets to show whether teams had started work. Once a vulnerability was no longer detected, its corresponding JIRA issue would automatically transition to 'Resolved'.

- ECS
- Flask
- AWS Lambda
- Scout Suite
- Cloudflare
- Mongodb
- terraform
- docker

### Owner Attribution graphql servce
One environment I was responsible for (before wiz.io) there were countless assets spread across AWS, Azure, GCP & private data centers owned by a myriad of teams. To get a handle on things, I created a Python service (deployed to AWS via Terraform) that would mine the parts we needed for inventory and compliance reporting. This data was also stored in DynamoDB & made available via graphql to lookup owners and related resources. Ops no longer had to ask about what AWS account a domain or IP belonged to!"

- Python
- Graphql
- Dynamodb
- AWS Lambda
- docker

### Authenticated DAST scans in CI
At one organization, there was a compliance initiative to integrate DAST into teams' CI pipelines, with a key goal of enabling authenticated scans of our web applications. To achieve this, I evaluated available tools and selected ZAP Proxy as the solution. I collaborated with multiple teams to streamline the integration of authenticated scans using ZAP, and [contributed directly](https://github.com/zaproxy/community-scripts/commit/d0582ac88b0973abd6097c04814f8081880ae99e#diff-8506b7511d2b5bf36f3b53f3cfa2f735de996c2ff4497ba3d65b0265df415b49) to the ZAP Core team—adding features like [ZAP Scan Hooks to improve automation support](https://github.com/zaproxy/zaproxy/commit/4f3d119b969be290607a87d3bec1c2c7f8bd1bb1). By the end of the campaign, the setup process was so refined that it could be communicated in a simple email, allowing teams to adopt it quickly and effectively.

- Python
- Jenkins
- OWASP Zap
- docker

### Building best practices for terraform in gitlab
At one of the organizations I worked with, there were no established best practices for securely managing AWS accounts using Terraform. Teams often created IAM users and embedded static AWS access keys as environment variables in CI/CD jobs—an insecure approach. To address this, I developed a pull request–driven workflow for managing AWS accounts via infrastructure as code (IaC) using Terraform. I built a reusable Terraform module that teams could use to provision separate IAM roles for terraform plan and terraform apply, each designed to be assumed via GitLab job JWT tokens. This approach eliminated long-lived access keys and significantly reduced the privilege level of CI/CD jobs.

- terraform
- gitlab ci
- AWS Lambda


### IOC Investigation assistant
At one organization, the incident response team was still maturing, and there was limited tooling available for efficiently processing indicators of compromise (IOCs). Initially, the team was reviewing IOCs manually until the volume of data turned it into an all-hands-on-deck situation. To streamline the process, I developed a tool that parsed logs, scored entries, and prioritized findings. I leveraged the Sigma rules repository, converting the rules into Python to evaluate them against incoming data, and used Microsoft’s MSTICPy tools to enrich those evaluations. The results were stored in a database and surfaced through a Flask web application, making it easier to quickly triage findings, identify patterns, and accelerate investigations—saving significant time and effort.

- [github.com/rezen/sigma-stuff](https://github.com/rezen/sigma-stuff)
- Flask
- Sigma
- sqlite

       

## Security Education


### Security Newsletter
At Barracuda to help improve the security culture I started and authored a monthly internal newsletter shared with engineering curating security resources, tools, and blog posts around specific topics. It was our internal tldrsec before there was tldrsec! I'm also experienced presenting internally in orgs on topics such as using security tools such as ZAP, semgrep & also on specific topics like CSP. I've also given talks at local meetups on nodejs OWASP Top 10 as well as WordPress security.


### Presentations
- [node.js Meetup - nodejs security](https://docs.google.com/presentation/d/1pQcfKgEKXjw4m_AX7P9kQJqdUjF8ry08ZSqVfXGBXbk/edit?slide=id.p#slide=id.p)
- [WordPress Meetup - WordPress Security](https://docs.google.com/presentation/d/1YWiDDrFljaBcg_6GVnS-PlK4vGSU_v2xP2M0pFaGW4o/edit?usp=sharing)
- [ZAP Intro & Automated Security Intro Training Extravaganza!](https://docs.google.com/presentation/d/1HH90X1Y6a0NfNnwJC9zyjSAIfWcjJviH1RxrNJ574qY/edit?usp=sharing)
    - [zap-tutorial](https://github.com/rezen/zap-tutorial)
- [CSP Intro](https://docs.google.com/presentation/d/1VSAJWZIvoVt3sBG93Lh4HZQ128nhaX9DCE6Wn0q77Lo/edit?usp=sharing)
- [Guest Speaker Presentation for AP Computer Science](https://docs.google.com/presentation/d/1sCf-GV25FwNFerIXxhOP3xP5tiZczj4lIJ_0m9kVFyE/edit?slide=id.g27e984ae0cb_0_50#slide=id.g27e984ae0cb_0_50)



## Languages
### Go
[I started learning Go around 8 years ago](https://github.com/rezen?tab=repositories&language=go) when I noticed many security tools were beginning to be built with it. One of my first experiments was using `goquery` to scrape Lego prices from Walmart and Target.  The first tool I shared was a [Retire.js replacement](https://github.com/rezen/retirejs), created because I was tired of asking people to install Node.js just to scan their JavaScript for vulnerabilities—I wanted a simple, standalone binary instead.  Since then, I’ve continued building with Go and have used it in production across various gRPC and HTTP/S services.

### Python
Being the only engineer on security teams often meant the tools I built needed to align with the common denominator of languages other team members were comfortable with. While I was very comfortable building tools in Node.js, most of the team was used to working with Python scripts.

That pushed me to start building with Python—creating tools that were more accessible and easier for the rest of the security team to contribute to. Here are some of my [python experiments](https://github.com/rezen?tab=repositories&language=python).


### JavaScript
Starting my career as a designer, JavaScript was one of the first languages I picked up. I remember when jQuery was *the* tool to use, and Backbone.js helped introduce MVC-style patterns to the frontend. I also worked with AngularJS 1.x—before all the major API changes.

When Node.js became a stable, cross-platform option, I loved the idea of writing JavaScript on both the frontend and backend. These days, JavaScript has become more complex with modern build toolchains, but I’ve kept up by working with frameworks like React and Vue for newer projects.

Here are some of my [JavaScript experiments](https://github.com/rezen?tab=repositories&language=javascript).


### PHP
Starting out in web development, it's hard to avoid PHP—especially with over 43% of the web running on WordPress (likely making PHP’s share even higher). I began my career at marketing agencies, turning PSDs into fully functional WordPress and PHP sites.

Over time, I built apps using frameworks like CodeIgniter, SlimPHP, and Laravel (I started using Laravel back in the 1.x days). Back then, PHP often caught flak — Rails was the hot framework, and even Jeffrey Way, known for his PHP tutorials, was dabbling in Rails content.

But PHP matured. The introduction of Composer was a major turning point, bringing modern dependency management to the ecosystem and elevating how PHP projects were built and maintained.

Here are some of my [PHP experiments](https://github.com/rezen?tab=repositories&language=php).
