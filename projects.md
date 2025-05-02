---
layout: page
title: projects
permalink: /projects/
---

Resumes aren’t always the best place to capture the full scope of the projects I’ve worked on. My rule of thumb: if it doesn’t fit on one page, it doesn’t make the cut. That said, for most of the projects I’ve taken on, I’ve served as the primary engineer—collaborating directly with stakeholders to define requirements and deliver effective solutions


## Cloud
I've had the opportunity to build all sorts of useful bits in the cloud, mostly AWS.

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
        

## Security Education


### Security Newsletter
At Barracuda to help improve the security culture I started and authored a monthly internal newsletter shared with engineering curating security resources, tools, and blog posts around specific topics. It was our internal tldrsec before there was tldrsec! I'm also experienced presenting internally in orgs on topics such as using security tools such as ZAP, semgrep & also on specific topics like CSP. I've also given talks at local meetups on nodejs OWASP Top 10 as well as WordPress security.


### Presentations
- [node.js Meetup - nodejs security](https://docs.google.com/presentation/d/1pQcfKgEKXjw4m_AX7P9kQJqdUjF8ry08ZSqVfXGBXbk/edit?slide=id.p#slide=id.p)
- [WordPress Meetup - WordPress Security](https://docs.google.com/presentation/d/1YWiDDrFljaBcg_6GVnS-PlK4vGSU_v2xP2M0pFaGW4o/edit?usp=sharing)
- [ZAP Intro & Automated Security Intro Training Extravaganza!](https://docs.google.com/presentation/d/1HH90X1Y6a0NfNnwJC9zyjSAIfWcjJviH1RxrNJ574qY/edit?usp=sharing)
- [CSP Intro](https://docs.google.com/presentation/d/1VSAJWZIvoVt3sBG93Lh4HZQ128nhaX9DCE6Wn0q77Lo/edit?usp=sharing)
- [Guest Speaker Presentation for AP Computer Science](https://docs.google.com/presentation/d/1sCf-GV25FwNFerIXxhOP3xP5tiZczj4lIJ_0m9kVFyE/edit?slide=id.g27e984ae0cb_0_50#slide=id.g27e984ae0cb_0_50)