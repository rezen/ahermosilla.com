---
layout: post
title:  "Reverse Engineering the az-cli to use the python sdk"
subtitle: "Figuring out how to use the azure-sdk for python"
categories: cloud
tags: [ azure, cloud, python ]
---

For scripting things in AWS, switching between boto and the aws cli is seamless because they use the same interfaces. The name of the python module matches the subcommand in the cli and the arguments and options all line up. This is not the case with Azure ....

There seems to be inconsistent names between the az-cli, azure-sdk & the Azure portal, which makes creating scripts a bit challenging. Additionally challenging, the docs are not fleshed out and hard to find, so I've had to 'trailblaze' to discover how to use the sdk.

After wrestling through figuring out how to find & install the modules necessary for certain datasets I have developed a pattern for discovering how to use the python sdk.

**Context**  
I was trying to create a script that pulled non-compliant resources from Azure Policy. The steps below document my journey to figuring out how to use the python sdk to do that.  

## Clone azure-cli
Search around for an `az` command that has the same names in the portal or yields similar data to the UI.
Digging through [docs](
https://docs.microsoft.com/en-us/cli/azure/policy/state?view=azure-cli-latest#az-policy-state-list
), `az policy state list -g "NameOfResourceGroup"` looked like it was a good place to start. We are going to clone the `azure-cli` repo and look for the modules that are used for that command.


```sh
# Clone repo
git clone https://github.com/Azure/azure-cli
cd azure-cli

# Look for the command pattern
# See output below
ag --python 'policy state'  --ignore-dir '*test' --ignore '**help.py*'
```
**Output**  
```
src/azure-cli/azure/cli/command_modules/policyinsights/_params.py
107:    with self.argument_context('policy state') as c:
112:            help='Within the specified time interval, get all policy states instead of the latest only.')
120:    with self.argument_context('policy state summarize') as c:

src/azure-cli/azure/cli/command_modules/policyinsights/commands.py
36:    with self.command_group('policy state', policy_states_sdk, client_factory=policy_states_operations) as g:

src/azure-cli/azure/cli/command_modules/sql/_params.py
790:                   help='Auditing policy state',
811:                   help='Threat detection policy state',
```

Now that the region of the code base is narrowed, let us open that directory in our editor `code src/azure-cli/azure/cli/command_modules/policyinsights/`.


When I look at the `commands.py` file, I notice `azure.mgmt.policyinsights.*`, which looks like a python module (which it is), so that is a good direction indicator.

```python
# ... Parts ommited for brevity
def load_command_table(self, _):
    policy_events_sdk = CliCommandType(
        operations_tmpl='azure.mgmt.policyinsights.operations#PolicyEventsOperations.{}',
        exception_handler=policy_insights_exception_handler
    )

    policy_states_sdk = CliCommandType(
        operations_tmpl='azure.mgmt.policyinsights.operations#PolicyStatesOperations.{}',
        exception_handler=policy_insights_exception_handler
    )
```

Next I'll do a case sensitive search for `Client` - I've noticed there a is `{$Service}Client` pattern in the python-sdk.

![Search For Client](/assets/img/reversing-az/code-find-client.png)

Sure enough, you can see the python module imported `from azure.mgmt.policyinsights import PolicyInsightsClient`. Equipped with that knowledge, we can take a look at the python sdk. The specific module is found in [here](https://github.com/Azure/azure-sdk-for-python/tree/master/sdk/policyinsights/azure-mgmt-policyinsights/azure/mgmt/policyinsights) and we can take a look at it to figure out how to use it.

## Look at Requests in UI
![AZ Policy](/assets/img/reversing-az/az-policy.png)  

Starting with the cli is a good place to start, however it doesn't always yield fruitful results.
Dig around in the UI for Policy, looking for properties, names, etc. One you can find is 
`providers/Microsoft.Management/managementGroups/corp/providers/Microsoft.Authorization/policyAssignments/205aa080f2cb4xxxxxxxx`. For me, the part that sticks out is the part right before an id, `policyAssignments`. Later, I'll look for anything with `policy` in the type of a resource using the Resource Graph Explorer.

I've noticed many pages interact directly with the same apis that the az-cli and python-sdk do, so I'll open my browser network requests inspector and see what I can find.

![AZ Policy Network](/assets/img/reversing-az/az-policy-network.png)  

So far, the endpoint with consistently useful data is `batch?api-version=xxxx`. If you look at the request it gives you a hint at what endpoints we want to interact with. I look at the request and `Microsoft.PolicyInsights/policyStates` is the part that sticks out to me as interesting. It is contained in part of a url, likely from an API that the sdk interacts with.

```json
{
  "requests": [
    {
      "httpMethod": "POST",
      "name": "5f152e3e-xxxx-yyyy-zzzz-000000000000",
      "requestHeaderDetails": {
        "commandName": "Microsoft_Azure_Policy."
      },
      "url": "https://management.azure.com/providers/Microsoft.Management/managementGroups/codxxxxx/providers/Microsoft.PolicyInsights/policyStates/latest/queryResults?api-version=2019-10-01&$top=250&$select=resourceId,resourceType,resourceLocation,timestamp,complianceState,policyDefinitionVersion,policySetDefinitionVersion&$filter=policyAssignmentId eq '/providers/Microsoft.Management/managementGroups/corp/providers/Microsoft.Authorization/policyAssignments/205aa080f2cb446a9exxxxxx' and policyDefinitionId eq '/providers/Microsoft.Authorization/policyDefinitions/34c877ad-xxxx-yyyy-zzzz-000000000000' and policyDefinitionReferenceId eq '13350666179920xxxxxxx' and ((complianceState eq 'noncompliant'))"
    }
  ]
}
```

Armed with a pattern to look for, let's try finding `Microsoft.PolicyInsights/policyStates` in the SDK.

```sh
# The sdk is ~200mb
git clone https://github.com/Azure/azure-sdk-for-python
cd azure-sdk-for-python/
ag --python 'Microsoft.PolicyInsights/policyStates'
```

**Output**  
```
sdk/policyinsights/azure-mgmt-policyinsights/azure/mgmt/policyinsights/operations/_policy_states_operations.py
149:    list_query_results_for_management_group.metadata = {'url': '/providers/{managementGroupsNamespace}/managementGroups/{managementGroupName}/providers/Microsoft.PolicyInsights/policyStates/{policyStatesResource}/queryResults'}
230:    summarize_for_management_group.metadata = {'url': '/providers/{managementGroupsNamespace}/managementGroups/{managementGroupName}/providers/Microsoft.PolicyInsights/policyStates/{policyStatesSummaryResource}/summarize'}
331:    list_query_results_for_subscription.metadata = {'url': '/subscriptions/{subscriptionId}/providers/Microsoft.PolicyInsights/policyStates/{policyStatesResource}/queryResults'}
411:    summarize_for_subscription.metadata = {'url': '/subscriptions/{subscriptionId}/providers/Microsoft.PolicyInsights/policyStates/{policyStatesSummaryResource}/summarize'}
515:    list_query_results_for_resource_group.metadata = {'url': '/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.PolicyInsights/policyStates/{policyStatesResource}/queryResults'}
598:    summarize_for_resource_group.metadata = {'url': '/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.PolicyInsights/policyStates/{policyStatesSummaryResource}/summarize'}
704:    list_query_results_for_resource.metadata = {'url': '/{resourceId}/providers/Microsoft.PolicyInsights/policyStates/{policyStatesResource}/queryResults'}
784:    summarize_for_resource.metadata = {'url': '/{resourceId}/providers/Microsoft.PolicyInsights/policyStates/{policyStatesSummaryResource}/summarize'}
858:    trigger_subscription_evaluation.metadata = {'url': '/subscriptions/{subscriptionId}/providers/Microsoft.PolicyInsights/policyStates/latest/triggerEvaluation'}
936:    trigger_resource_group_evaluation.metadata = {'url': '/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.PolicyInsights/policyStates/latest/triggerEvaluation'}
1041:    list_query_results_for_policy_set_definition.metadata = {'url': '/subscriptions/{subscriptionId}/providers/{authorizationNamespace}/policySetDefinitions/{policySetDefinitionName}/providers/Microsoft.PolicyInsights/policyStates/{policyStatesResource}/queryResults'}
1126:    summarize_for_policy_set_definition.metadata = {'url': '/subscriptions/{subscriptionId}/providers/{authorizationNamespace}/policySetDefinitions/{policySetDefinitionName}/providers/Microsoft.PolicyInsights/policyStates/{policyStatesSummaryResource}/summarize'}
1231:    list_query_results_for_policy_definition.metadata = {'url': '/subscriptions/{subscriptionId}/providers/{authorizationNamespace}/policyDefinitions/{policyDefinitionName}/providers/Microsoft.PolicyInsights/policyStates/{policyStatesResource}/queryResults'}
1315:    summarize_for_policy_definition.metadata = {'url': '/subscriptions/{subscriptionId}/providers/{authorizationNamespace}/policyDefinitions/{policyDefinitionName}/providers/Microsoft.PolicyInsights/policyStates/{policyStatesSummaryResource}/summarize'}
1420:    list_query_results_for_subscription_level_policy_assignment.metadata = {'url': '/subscriptions/{subscriptionId}/providers/{authorizationNamespace}/policyAssignments/{policyAssignmentName}/providers/Microsoft.PolicyInsights/policyStates/{policyStatesResource}/queryResults'}
1504:    summarize_for_subscription_level_policy_assignment.metadata = {'url': '/subscriptions/{subscriptionId}/providers/{authorizationNamespace}/policyAssignments/{policyAssignmentName}/providers/Microsoft.PolicyInsights/policyStates/{policyStatesSummaryResource}/summarize'}
1612:    list_query_results_for_resource_group_level_policy_assignment.metadata = {'url': '/subscriptions/{subscriptionId}/resourcegroups/{resourceGroupName}/providers/{authorizationNamespace}/policyAssignments/{policyAssignmentName}/providers/Microsoft.PolicyInsights/policyStates/{policyStatesResource}/queryResults'}
1700:    summarize_for_resource_group_level_policy_assignment.metadata = {'url': '/subscriptions/{subscriptionId}/resourcegroups/{resourceGroupName}/providers/{authorizationNamespace}/policyAssignments/{policyAssignmentName}/providers/Microsoft.PolicyInsights/policyStates/{policyStatesSummaryResource}/summarize'}
```

So starting from the UI we've narrowed down what part of the SDK to interact with. This lines up with what we discovered earlier looking at the azure-cli. Typically a module for a service has `models` &  `operations` directories, so we want to open the directory above, `sdk/policyinsights/azure-mgmt-policyinsights/azure/mgmt/policyinsight`. Generally, with modules, we don't want to interact directly with `operations/*.py`, there is a "public-interface" via a client which executes operations. To find the "public-interface" you need to look in `__init__.py`.

Looking at `__init__.py` you will find `__all__ = ['PolicyInsightsClient', 'PolicyInsightsClientConfiguration']`, which is python for "you can/should access these in this module". From there if you drill down into the client in `_policy_insights_client.py` you will see the operation we found being imported and used in the client's `__init__` method.



## Look at Resource Graph

![AZ Resource Graph](/assets/img/reversing-az/az-rg-query.png)    

Some resources can be fetched using the resource graph. Once you have the pattern down for interacting with the resource graph client, instead of having to figure out additional clients you can possibly just figure a new query.

For example, if I wanted to get all public ips, using the network module from the python-sdk, it would take some effort. However, I can create a resource graph query to get that same data without having to iterate through all the subscriptions and resource groups

#### Example
```
where type in~ ('Microsoft.Network/PublicIpAddresses') and isnotempty(properties.ipAddress) 
  | project id,name,type,location,subscriptionId,resourceGroup,kind,tags,properties.ipAddress 
  | sort by tolower(tostring(name)) asc
```

```python
import azure.mgmt.resourcegraph.models as rg
from azure.mgmt.resourcegraph import ResourceGraphClient
# Parts omitted for brevity
def resource_graph_all(query):
    credentials = get_credentials()
    subscriptions = get_subscriptions()
    subscription_ids = [s.subscription_id for s in subscriptions]
    results = []
    has_more = True
    per_page = 1000
    page = 0

    while has_more:
        options = rg.QueryRequestOptions(top=per_page, skip=page * per_page)
        query_request = rg.QueryRequest(
            subscriptions=subscription_ids,
            query=query,
            options=options
        )
        client = ResourceGraphClient(credentials)
        response = client.resources(query_request)
        columns = [c['name'] for c in response.data['columns']]
        results =  results + [dict(zip(columns, r)) for r in response.data['rows']]
        has_more = response.count == per_page
        page += 1

    return results
```

### Discovery
It's not immediately clear what resources are available to query. I find querying with `type contains '...'` and trying different values helps me to discover what types of data are available. When I looked around for resources around policy, there was nothing that stuck out.


```
resources 
| where type contains 'insight' or type contains 'policy'
| distinct  type
```

## Sample
Okay, so with all that spelunking, what did we finally land on for getting the policy state using the python-sdk?

```python
import shared.azure as az
from azure.mgmt.policyinsights import PolicyInsightsClient

credentials = az.get_credentials()
insights = PolicyInsightsClient(credentials)
response = insights.policy_states.list_query_results_for_management_group('latest', 'rootmanagementgroup')

# @todo needs pagination
for val in response.value:
  print(val)
```