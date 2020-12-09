---
layout: post
title:  "Setup Windows 10 in Azure"
subtitle: "Have an environment for testing apps without running a VM"
categories: cloud
tags: [ azure, cloud, windows ]
---

![RDP](/assets/img/windows-10-rdp.png)  


The other day I needed to test a Windows application, but I'm using a Mac. If you need to audit/test a Windows application on a Mac or Linux box, Microsoft provides some developer VM images you can use for free <https://developer.microsoft.com/en-us/windows/downloads/virtual-machines/>. I went ahead and downloaded the VM image for VirtualBox and starting the VM. I allocated 3 cores and 8GB of RAM thinking that should be enough power to test reasonably (I'm using MacBook Pro 2018 with the i5 and 16GB of RAM). Overall performance was tolerable, but I kept having issues where the VM would unresponsive for 30 seconds at a time. When auditing an application, the speed of iteration is important - I want to a fast feedback cycle when interacting with the application - this was not happening.

Switching gears a bit, I've been learning Azure, mostly from the perspective of securing cloud resources. It is really easy to deploy resources & Microsoft tech (eg Windows 10) has first-class support. I thought, what if instead of trying to tune settings in Windows & VirtualBox to get tolerable performance, what if I just deploy a VM in Azure and [RDP](https://apps.apple.com/us/app/microsoft-remote-desktop/id1295203466) in? After having gone through the process, I can tell you, a Windows environment in Azure takes very little effort!

My goal during this discovery process was to be able to quickly setup new environments for new applications I needed to test. I wanted to have a script at the end which I could use to spin up assets. I would start by creating a resource in the Azure Portal and then try to do the same with with the `az-cli` (`pip install azure-cli`).

## Steps
### Resource Group
In Azure, any resource you create will fall under your subscription, as well as a Resource Group, which is essentially a named grouping bucket you create.

```sh
az group create -l westus -n DesktopAppTest
```

*An aside, if you have multiple Azure subscriptions, you will need to specify which subscription the resources will deploy into.*

```sh
# Select which subscription you want to perform actions in
az account set --subscription c3a7d4a7-xxxx-yyyy-zzzz-000000000000
```

### Create VM
When creating a VM in Azure, there are countless options, but in this context there are a couple that are important. You need to figure the specific image you will be using as well as the size (CPU/MEM) for the VM configuration.

```sh
# List images ... you can find Windows 10
az vm image list --output table
az vm image list --output table --all --offer Windows-10

# Output sample
Offer       Publisher                Sku                          Urn                                                                                   Version
----------  -----------------------  ---------------------------  ------------------------------------------------------------------------------------  ---------------------
Windows-10  MicrosoftWindowsDesktop  19h1-ent                     MicrosoftWindowsDesktop:Windows-10:19h1-ent:18362.836.2005071659                      18362.836.2005071659
Windows-10  MicrosoftWindowsDesktop  19h1-ent                     MicrosoftWindowsDesktop:Windows-10:19h1-ent:18362.900.2006061800                      18362.900.2006061800
Windows-10  MicrosoftWindowsDesktop  19h1-ent                     MicrosoftWindowsDesktop:Windows-10:19h1-ent:18362.959.2007101755                      18362.959.2007101755
Windows-10  MicrosoftWindowsDesktop  19h1-ent-gensecond           MicrosoftWindowsDesktop:Windows-10:19h1-ent-gensecond:18362.836.2005071659            18362.836.2005071659
Windows-10  MicrosoftWindowsDesktop  19h1-ent-gensecond           MicrosoftWindowsDesktop:Windows-10:19h1-ent-gensecond:18362.900.2006061800            18362.900.2006061800
Windows-10  MicrosoftWindowsDesktop  19h1-ent-gensecond           MicrosoftWindowsDesktop:Windows-10:19h1-ent-gensecond:18362.959.2007101755            18362.959.2007101755
Windows-10  MicrosoftWindowsDesktop  19h1-entn                    MicrosoftWindowsDesktop:Windows-10:19h1-entn:18362.836.2005071659                     18362.836.2005071659
Windows-10  MicrosoftWindowsDesktop  19h1-entn                    MicrosoftWindowsDesktop:Windows-10:19h1-entn:18362.900.2006061800                     18362.900.2006061800
```

```sh
# List sizes ... we want at least 8GB memory
az vm list-sizes --location westus --output table

# Output sample
MaxDataDiskCount    MemoryInMb    Name                    NumberOfCores    OsDiskSizeInMb    ResourceDiskSizeInMb
------------------  ------------  ----------------------  ---------------  ----------------  ----------------------
64                  5836800       Standard_M208ms_v2      208              1047552           4194304
64                  2918400       Standard_M208s_v2       208              1047552           4194304
64                  5836800       Standard_M416-208s_v2   416              1047552           8388608
64                  5836800       Standard_M416s_v2       416              1047552           8388608
64                  11673600      Standard_M416-208ms_v2  416              1047552           8388608
64                  11673600      Standard_M416ms_v2      416              1047552           8388608
8                   172032        Standard_NP10s          10               1047552           753664
16                  344064        Standard_NP20s          
```
For the image I used `MicrosoftWindowsDesktop:Windows-10:19h1-pro:18362.959.2007101755`, which is the image you select when you use the Azure portal. The VM size `Standard_D2ds_v4` provides 8GB of MEM and 2 CPU, which for the application I was running was going to be enough power.

```sh
# Create a vm using a Windows 10 VM
az vm create -n win-10-app-x-test -g DesktopAppTest \
	--image 'MicrosoftWindowsDesktop:Windows-10:19h1-pro:18362.959.2007101755' \
	--admin-username myapp \
	--size Standard_D2ds_v4 --location  westus
```


When you run the command, it will prompt you to input a password for RDP. Make sure to use a password with at least 20 characters since this asset will be exposed to the internet after deployment. (We'll remedy this later)

```sh
# Output sample
Admin Password: 
Confirm Admin Password: 
{- Finished ..
  "fqdns": "",
  "id": "/subscriptions/c3a7d4a7-xxxx-yyyy-zzzz-000000000000/resourceGroups/DesktopAppTest/providers/Microsoft.Compute/virtualMachines/win-10-app-x-test",
  "location": "westus",
  "macAddress": "00-0D-3A-F6-F4-FC",
  "powerState": "VM running",
  "privateIpAddress": "10.0.1.7",
  "publicIpAddress": "40.91.105.xxx",
  "resourceGroup": "DesktopAppTest",
  "zones": ""
}
```

### Bootstrapping
There is likely a baseline setup of tools & apps you want to be installed on your VM. Having to manually install those tools every time you create a new box up would be time consuming. I wanted to script up installing the tools (Burp,ZAP,FireFox,etc) to get things moving faster. Luckily, for Windows, there is a third party package manager (think `brew` or `apt-get`) called [Chocolatey](https://chocolatey.org/). I created a small PowerShell script to install Chocolatey as well as some base packages I would need in every environment. You can copy the script and save in `bootstrap.ps1`.

```powershell
# Install chocolatey and configure env 
Set-ExecutionPolicy Bypass -Scope Process -Force;
iex ((New-Object System.Net.WebClient).DownloadString("https://chocolatey.org/install.ps1"));
SET 'PATH=%PATH%;C:\ProgramData\chocolatey\bin';

# Set system wide environment variable
[System.Environment]::SetEnvironmentVariable('APP_DEBUG_FLAG', '1', [System.EnvironmentVariableTarget]::Machine);
$env:path += ';C:\ProgramData\chocolatey\bin\';

# Install apps with choco
choco install -y burp-suite-free-edition
choco install -y sysmon
choco install -y procexp
choco install -y firefox
choco install -y ag
choco install -y strings
choco install -y vscode

# Download specific files
New-Item -ItemType Directory -Force -Path 'C:\\installers'
(new-object System.Net.WebClient).Downloadfile('https://getcomposer.org/Composer-Setup.exe', 'C:\\installers\Composer-Setup.exe')

# Show hidden holders & show extensions in explorer
$key = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced'
Set-ItemProperty $key Hidden 1
Set-ItemProperty $key HideFileExt 0
Stop-Process -processname explorer
```

Copying and pasting this file via RDP is not that big a deal, but I wanted to make the process as hands off as possible. I tried to embed the script in `customdata` during deployment, but never had luck with getting that working. I ending up settling on `az vm run-command invoke --command-id RunPowerShellScript` to execute the bootstrapping script.

```sh
group='DesktopAppTest'
location='westus'
vmname='win-10-app-x-test'

# Run a script using a file 
az vm run-command invoke  --command-id RunPowerShellScript \ 
	--name "${vmname}" -g "${group}"  \
	--scripts @bootstrap.ps1  
```

### Security
I mentioned earlier, by default, your VM will be exposed to the internet. Azure has assigned/created a Network Security Group which is attached to your VM's NIC. You can alter to tighten up the security - we should limit the source addresses for RDP to your personal IP

```sh
group='DesktopAppTest'
location='westus'
vmname='win-10-app-x-test'

# Update network security group to only allow RDP from your ip
nsgid=$(az network nic show  --ids "$(az vm show --name "${vmname}" -g "${group}" --query 'networkProfile.networkInterfaces[0].id' --output tsv)" --query 'networkSecurityGroup.id' --output tsv)

ruleid=$(az network nsg show --ids "${nsgid}" --query 'securityRules[?destinationPortRange == `"3389"`].id | [0]' --output tsv)

# Use ifconfig.co to get your ip to update the rule
az network nsg rule update --ids "${ruleid}"  --source-address-prefixes "$(curl https://ifconfig.co/)/32"
```

## Improvements
If you are spinning up new VMs often, you should take a look at [Packer](https://www.packer.io/) for building base images. Once you have a base image with your apps installed, you can deploy that instead of doing a fresh install of apps each deploy.