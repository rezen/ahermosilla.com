---
layout: post
title:  "Leveraging AWS signed requests for Identity Proof"
categories: security
tags: [ api, aws, cloud ]
---

I was working on an internal API that I wanted to make available for other ops team members. The security team has their own AWS account and ops have their own AWS accounts as well as the various product teams business units. I wanted to, with little effort, enable teams to use my API which was built on AWS API Gateway + AWS Lambda. There is no need for granular authorization since the API is readonly so I configured the API Gateway to use API Keys. I wanted to have self-service API key generation, where the user could generate their own API key with their username as the key name.

Previously, I have used IAM permissions to enable other teams in our same AWS organization to read objects from an S3 Bucket ([See sample here](https://gist.github.com/rezen/018c4bf5e98de4c04baacf678df8b80f)). I figured there had to be similar constructs that could be leveraged to enable users to generate API keys with their AWS authentication material (aws_access_key_id,aws_secret_access_key,aws_session_token). One bit that made this less straightforward was I wanted to create a key with the username of the actor. How could I get a verified username and not just a random username supplied by an actor.

If you are familiar with `awscli` and have had to work with multiple accounts and use temporary credentials from STS you have probably used `aws sts get-caller-identity`. I like to think of it as the `whoami` of AWS. I interact with many accounts so sometimes I have to check and remember what role & account a session is connected to. I figured there had to be a way to build that request and send that to a key generation endpoint which would pass it on to AWS and then get the identity out of the response back.

### AWS Signed Requests
After doing some research, my assumptions were confirmed, the answers lied within how AWS' API worked with signed requests. Before we jump into that, I want to take a step back.  When you use `boto3` or `awscli`  or any other AWS library, they are just wrappers for AWS APIs. When you interact with those APIs, your credential material is not used in the same way as it is frequently with other APIs. For example, when you generate API tokens for Github, when you use the token, it will look something like this.

```sh
curl -H "Authorization: token XXXXXXXXXXX" https://api.github.com
```

With AWS APIs, you don't send your credential material in that way, as explained in their docs.

> When you send HTTP requests to AWS, you sign the requests so that AWS can identify who sent them. You sign requests with your AWS access key, which consists of an access key ID and secret access key.
https://docs.amazonaws.cn/en_us/general/latest/gr/signing_aws_api_requests.html

AWS states the following reasons for using signed requests:
- Verify the identity of the requester
- Protect data in transit
- Protect against potential replay attacks

#### Request Signing
I'm not going to go into the details of how to make signed requests, here are the docs and some examples you can check out. Essentially the url (with params), body & headers need to be signed, it's not terribly hard to follow along and implement yourself.

- https://docs.aws.amazon.com/general/latest/gr/sigv4_signing.html
- https://docs.aws.amazon.com/general/latest/gr/sigv4-signed-request-examples.html
- https://github.com/boto/botocore/blob/develop/botocore/auth.py#L151

To get an idea of what a request looks like you can use `--debug` flag with the `aws sts get-caller-identity`. As debug output is being generated you should see `Calculating signature using v4 auth` and from there you can see the details of the request. 

```sh
> aws --debug sts get-caller-identity
--- snip ---
2020-11-16 15:09:44,909 - MainThread - botocore.auth - DEBUG - Calculating signature using v4 auth.
2020-11-16 15:09:44,909 - MainThread - botocore.auth - DEBUG - CanonicalRequest:
POST
/

content-type:application/x-www-form-urlencoded; charset=utf-8
host:sts.amazonaws.com
x-amz-date:20201116T230944Z
x-amz-security-token:**************************

content-type;host;x-amz-date;x-amz-security-token
ab821ae955788b0e33ebd34c208442ccfc2d406***************
2020-11-16 15:09:44,909 - MainThread - botocore.auth - DEBUG - StringToSign:
AWS4-HMAC-SHA256
20201116T230944Z
20201116/us-east-1/sts/aws4_request
45dd2e3a3e33191062c6a6b8d88adfee856877d****************
2020-11-16 15:09:44,909 - MainThread - botocore.auth - DEBUG - Signature:
5ef29f57c5df6bd4283faa328e8a74ea940dcac695fc71d70*************
2020-11-16 15:09:44,909 - MainThread - botocore.endpoint - DEBUG - Sending http request: <AWSPreparedRequest stream_output=False, method=POST, url=https://sts.amazonaws.com/, headers={'Content-Type': b'application/x-www-form-urlencoded; charset=utf-8', 'User-Agent': b'aws-cli/1.18.122 Python/3.8.5 Darwin/18.7.0 botocore/1.13.50', 'X-Amz-Date': b'20201116T230944Z', 'X-Amz-Security-Token': b'********************', 'Authorization': b'AWS4-HMAC-SHA256 Credential=ASIASBWKLLBJOPCMUUVR/20201116/us-east-1/sts/aws4_request, SignedHeaders=content-type;host;x-amz-date;x-amz-security-token, Signature=5ef29f57c5df6bd4283faa328e8a74ea940dcac695fc71d70*************', 'Content-Length': '43'}>
2020-11-16 15:09:44,910 - MainThread - urllib3.connectionpool - DEBUG - Starting new HTTPS connection (1): sts.amazonaws.com:443
2020-11-16 15:09:45,338 - MainThread - urllib3.connectionpool - DEBUG - https://sts.amazonaws.com:443 "POST / HTTP/1.1" 200 465
2020-11-16 15:09:45,339 - MainThread - botocore.parsers - DEBUG - Response headers: {'x-amzn-RequestId': '17d14169-3a03-421d-837e-a*****', 'Content-Type': 'text/xml', 'Content-Length': '465', 'Date': 'Tue, 17 Nov 2020 00:57:17 GMT'}
2020-11-16 16:57:17,451 - MainThread - botocore.parsers - DEBUG - Response body:
b'<GetCallerIdentityResponse xmlns="https://sts.amazonaws.com/doc/2011-06-15/">\n  <GetCallerIdentityResult>\n    <Arn>arn:aws:sts::1499999991:assumed-role/ReadOnly/ahermosilla@example.com</Arn>\n    <UserId>AROASBWKLLBJFBLYSYIDR:ahermosilla@example.com</UserId>\n    <Account>1499999991</Account>\n  </GetCallerIdentityResult>\n  <ResponseMetadata>\n    <RequestId>8f4dec63-58a0-49b1-8e31-dea0a309b7bc</RequestId>\n  </ResponseMetadata>\n</GetCallerIdentityResponse>\n'
2020-11-16 16:57:17,452 - MainThread - botocore.hooks - DEBUG - Event needs-retry.sts.GetCallerIdentity: calling handler <botocore.retryhandler.RetryHandler object at 0x10b6c1ca0>
2020-11-16 16:57:17,452 - MainThread - botocore.retryhandler - DEBUG - No retry needed.
2020-11-16 16:57:17,453 - MainThread - awscli.formatter - DEBUG - RequestId: 8f4dec63-58a0-49b1-8e31-dea0a309b7bc
{
    "UserId": "AROASBWKLLBJFBLYSYIDX:ahermosilla@example.com",
    "Account": "1499999991",
    "Arn": "arn:aws:sts::1499999991:assumed-role/ReadOnly/ahermosilla@example.com"
}
```

The debug output provides a good idea of the shape of a request to an AWS API.  We know  (and verified) requests are signed with our credential materials which means we could hand off that request to another service and not worry about that service tampering with the request or making requests to other APIs since AWS verifies the signature of the request. (You should also notice the object `AWSPreparedRequest` is referenced in the logs, hinting at what class boto is using to construct the request.)


#### An aside on S3
Outside of signed requests happening "under the hood" with boto and awscli, one place you have probably seen signed requests is with S3. It is a common pattern for applications to store files in S3 and then later provide access to the user to those files. Instead of having a route pass the file through (incurring additional network latency) you can create a [presigned url](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/s3-presigned-urls.html) and the user hits AWS directly to download the file. This pattern is also leveraged to enable end users to [directly upload files](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/s3-presigned-urls.html#generating-a-presigned-url-to-upload-a-file) to your S3 bucket with parameters you specify.


**STS API**  
AWS has thorough docs of all their APIs (https://docs.aws.amazon.com/), but the one specifically we are looking for is the one around `get-caller-identity` which can be found here https://docs.aws.amazon.com/STS/latest/APIReference/API_GetCallerIdentity.html. If you compare the API examples versus the output from the last request you see they match up, we can verify this is the API we want to build the request for.

Unlike the examples of S3 mentioned above, where a service is providing signed urls for the user to interact with an AWS account's resources, we want the user to provide a signed request to act as bearer of their identity. We want to know they are part of organization **X** and have **Y** assumed role before we vend them an API key. Our endpoint is going to pass on the signed request with the response as bearer proof of identity, inspecting the response to verify the actor's identity is allowed to interact with our API.


### Use Botocore to create client
Now we could put together all pieces ourselves starting from the example for creating signed requests, but why? We know **boto** already has the pieces for creating signed requests so let's go ahead and leverage it. We need to build the request like we are going send it to STS, but then send it to our endpoint instead.

```python
import os
from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest
from botocore.credentials import get_credentials
from botocore.endpoint import URLLib3Session
import boto3
import requests

session = boto3.Session()
credentials = session.get_credentials()
credentials = credentials.get_frozen_credentials()
signer = SigV4Auth(credentials, 'sts', 'us-east-1')

endpoint = 'api.example.com'
request = AWSRequest(
    method='POST', 
    url="https://sts.amazonaws.com/", 
    data="Action=GetCallerIdentity&Version=2011-06-15", 
    headers={
        'Host': 'sts.amazonaws.com',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'X-Audience': endpoint,
    }
)
signer.add_auth(request)

if 'dev' in os.environ.get('PY_ENV', ''):
    print(request.headers)
    print(request.body)

# To send to STS directly ....
# sender = URLLib3Session()
# response = sender.send(request.prepare())

# To send to our API, we use the request boto created with the 
# signature components
headers = dict(request.headers)
headers.pop('Host')
response = requests.post(f'https://{endpoint}/key', headers=headers, data=request.body)
print(response.status_code)
print(response.headers)
print(response.text)
```

The endpoint needs to pull out the headers authorization, x-amz-date, x-amz-security-token, x-audience to pass on to the STS API. Our endpoint is on a different host, so we don't use that, rather we use `sts.amazonaws.com`, but the other parts are part of the original request to STS. Below is an example implementation of passing on the identity request on to AWS STS. This shows an example using [API Gateway Authorizer](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html) to authorize request paths. There is an endpoint to `POST /key` which will is behind this authorizer which will receive the identity (passed from the authorize context) in it's handler context.



```python
import os
import json
import boto3
import http.client
import urllib.parse
import socket
import xml.etree.ElementTree as ET

def deny_response(message):
    return {
    	"policyDocument": {
    		"Version": "2012-10-17",
    		"Statement": [
    			{
    				"Action": "execute-api:Invoke",
    				"Effect": "Deny",
    				"Resource": "*",
    			}
    		]
    	},
    	"context": {
    	    'message': f'{message}'
    	}
    }

def handler(event, context):
    authorized_accounts = [a for a in os.environ.get('AUTHD_ACCTS', '').split(",") if a]
    authorized_roles = [r for r in os.environ.get('AUTHD_ROLES', '').split(",") if r]

    headers = event.get('headers', {})

    # Since API Gateway routes based on hostnames we know the host can be 
    # trusted. To be extra sure you could instead compare against
    # an environment variable of X_AUDIENCE 
    host = headers['host'] if 'host' in headers else headers.get('Host')
    
    # For the client's safety, expect this header
    if 'x-audience' not in headers:
        print("Did not supply x-audience header")
        return deny_response("A x-audience header is required")
    
    # ... and then assert the audience and the host are the same
    # This protects the client from host replay attacks
    if headers.get('x-audience') != host:
        print(f"Mismatch with host and x-audience header - audience={headers.get('x-audience')} host={host}" )
        return deny_response("Mismatch with host and x-audience header")

    keep = ['authorization', "x-amz-date", "x-amz-security-token", 'x-audience']
    keep = [k for k in headers if k.lower() in keep]
    
    authd = {k.lower(): headers[k] for k in keep if k in headers}
    
    if 'x-authorization' in headers:
        authd['authorization'] = headers.get('x-authorization')
    
    if 'authorization' not in authd:
        print("No authorization provided")
        return deny_response("No authorization header provided")

    if 'x-audience' not in authd['authorization']:
        print("The header x-audience was not included in the signature")
        return deny_response("The header x-audience was not included in the signature")
    
    params = urllib.parse.urlencode({ 
        'Action': "GetCallerIdentity", 
        'Version': "2011-06-15" 
    })

    authd['User-Agent'] = 'Boto3/1.10.28 Python/3.8.5 Darwin/18.7.0 Botocore/1.13.50'
    authd['Accept-Encoding'] = 'identity'
    authd["Content-Type"] = "application/x-www-form-urlencoded; charset=utf-8"
    authd['Content-Length'] = len(params)

    conn = http.client.HTTPSConnection("sts.amazonaws.com") 
    conn.request("POST", "/", params, authd)
    response = conn.getresponse()
    data = response.read()

    print(response.status, response.reason)
    print(response.getheaders())

    if "ExpiredToken" in str(data):
        print("Using expired tokens ....")
        return deny_response("The token provided is expired")

    if response.status != 200:
        print("Request was not successful with sts")
        print(data)
        return deny_response("Request STS failed")
    
    
    tree = ET.ElementTree(ET.fromstring(data))
    root = tree.getroot()
    nodes = [n.getchildren() for n in root if n.tag.split("}")[-1] == "GetCallerIdentityResult"].pop()
    
    if not nodes:
        print("No nodes?")
        return deny_response("STS response not validated")
    
    data = {n.tag.split("}")[-1]: n.text for n in nodes}
    
    if 'Arn' not in data or 'Account' not in data:
        print("The sts data is missing bits")
        return deny_response("STS response not validated")
    
    print("Authorized "  + json.dumps(data))
    parts = data['Arn'].split("/")
    data['Username'] = parts.pop()
    data['Role'] = parts[1] if len(parts) > 1 else None

    if not data.get('Account') or data.get('Account') not in authorized_accounts:
        return deny_response("That account is not authorized")

    if not data.get('Role') or data.get('Role') not in authorized_roles:
        return deny_response("That role is not authorized")

    resource = event.get('methodArn') if 'methodArn' in event else event.get('routeArn')

    return {
    	"principalId": data['Username'],
    	"policyDocument": {
    		"Version": "2012-10-17",
    		"Statement": [
    			{
    				"Action": "execute-api:Invoke",
    				"Effect": "Allow",
    				"Resource": resource,
    			}
    		]
    	},
    	"context": data,
    }
```

**x-audience**  
Signed requests support adding arbitrary headers. We pass on `x-audience` with the hostname of endpoint the client intends to provide the proof of identity. The endpoint needs to verify the `x-audience` matches the hostname it has been assigned to protect against replay attacks. Without this additional header, another service could accept a user's proof of identity, pass it on to our service and then receive the user's API key. However, the client signs this header and sets it to the value of the intended audience which is the same value as the hostname of the endpoint. This prevents the client from sending the proof of identity to a "bad acting endpoint" and have the request go all the way through. When our endpoint receives the request in from a "bad actor", it will see the `x-audience` does not match it's configured hostname (the client sets it to the bad actor's hostname) and reject the request. If a client made a request with `x-audience` not matching the hostname of the endpoint, they would not be protected, ultimately it is up to the client to protect themselves. (This technique was directly inspired by Hashicorp Vault, check out the section on validation below)


### Creating the API Key 
After the authorizer allows the request to continue on, the authorizer context will be passed on to the request lambda. The event will include the context `event['requestContext']['authorizer']` which you can then  be used to create an API Key in API Gateway. 

```python
import re
import os
import json
import boto3
import string 
import random 
import base64

# You should use secrets manager to generate randomness but alas this serves as an example
# aws secretsmanager get-random-password --password-length 32 --require-each-included-type --exclude-characters '"'@/\"'"' | jq -r ".RandomPassword"'
def generate_random(size=48):
    return ''.join(random.choices(string.ascii_letters +
                             string.digits, k = size)) 


def unauthorized(actor=None):
    return {
        'statusCode': 400,
        'body': json.dumps({
            'message': 'You are not authorized for this',
            'actor': actor,
        }),
    }


def handler(event, context):
    # Verify this is called with an authorizer in front
    actor = event.get('requestContext', {}).get('authorizer', None)
    if actor is None:
        return unauthorized('No authorizer')
    
    # ... which provides us a username
    username = actor.get('Username')
    if not username:
        return unauthorized(actor)
    
    plan_id = os.environ['USAGE_PLAN']
    api_id = os.environ['API_ID']
    stages = [s.strip() for s in os.environ['API_STAGES'].split(',') if s.strip()]
    client = boto3.client('apigateway')
    already_has_key = False
    key_id = None
    try:
        response = client.get_api_keys(
            nameQuery=username,
            includeValues=False
        )
        items = response.get('items', [])
        already_has_key = len(items) > 0
        key_id = items[0]['id'] if already_has_key else None

    except Exception as err:
        print(err)
        err_string = re.sub(r"\d", "x", f'{err}')
        return {
            'statusCode': 500,
            'body': json.dumps({"error": err_string})
        }

    if already_has_key:
        return {
            'statusCode': 200,
            'body': json.dumps({
                "message": "You already generated an api key",
                'key_id': key_id,
                "username": username,
            })
        }

    key_value = username + ":" + generate_random()
    key_value = base64.b64encode(key_value.encode('ascii')).decode('ascii')

    try:    
        response = client.create_api_key(
            name=username, 
            description='Self service created key', 
            enabled=True, 
            value=key_value,
            stageKeys=[{'restApiId': api_id, 'stageName': s} for s in stages],
            tags={
                'SrcAccount': actor.get('Account'),
                'Role': actor.get('Role'),
            }
        )
    
        client.create_usage_plan_key(
            usagePlanId=plan_id,
            keyId=response['id'],
            keyType='API_KEY')    
    except Exception as err:
        print(err)
        err_string = re.sub(r"\d", "x", f'{err}')
        return {
            'statusCode': 500,
            'body': json.dumps({"error": err_string})
        }

    return {
        'statusCode': 200,
        'body': json.dumps({
            'username': username,
            'key_id': response['id'],
            'api_key': response['value']
        }),
    }
```

## Validation
If you are wondering if it is a good idea to use signed requests to STS as bearer proof of identity, you are not alone. I asked myself this same question, but it turns out Hashicorp Vault uses this same technique for authentication. That is where I discovered the pattern of adding additional headers for verification

- https://www.youtube.com/watch?v=bCNSvUrK_BA&list=WL&index=2&t=1377s
