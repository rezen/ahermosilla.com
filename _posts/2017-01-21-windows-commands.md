---
layout: post
title:  "Inspecting Windows with cli!"
subtitle: "... Windows isn't all that bad"
categories: tools
tags: [ windows ]
---
* TOC
{:toc}


I'm pretty green when it comes to knowledge of windows commands & cli tools.
From the security perspective, a large percent of businesses/corporations run 
windows on their platform, so some basic tools to introduce ideas is helpful!



### WMI
With the command line you can use `wmic` or `powershell` to utilize WMI (Windows Management Instrumentation) which can give you insight into all sorts of things about your system!

- <https://betanews.com/2011/01/14/wmic-the-best-command-line-tool-you-ve-never-used/>
- <http://www.dedoimedo.com/computers/windows-wmic.html>
- <http://people.virginia.edu/~rtg2t/winadmin/wmic.html>

**Get Windows Version**

```shell
> wmic os get Name,Version,BuildNumber,OSArchitecture,InstallDate
BuildNumber  InstallDate                Name                             OSArchitecture  Version
14393        20161028165102.000000-420  Microsoft Windows 10 Enterprise  64-bit          10.0.14393
```

#### Powershell
@todo Fill this out more!

```powershell
:: List available objects
Get-WmiObject -List

:: Logged on users
Get-WmiObject Win32_LoggedOnUser

:: Users ...
Get-WmiObject Win32_SystemUsers

:: Get processes
Get-WmiObject Win32_Process | Format-Table -Wrap -Property Name,Path,ExecutablePath,ProcessId,CreationDate

:: What is running in startup?
Get-WmiObject Win32_StartupCommand
```

### Hardware
I used to always use cpu-z to id the hardware, but there are plenty of other tools to
figure out hardware is on the system you're using.

```shell
> systeminfo

Host Name:                 REZEN
OS Name:                   Microsoft Windows 7 Professional
OS Version:                6.1.7601 Service Pack 1 Build 7601
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Workstation
OS Build Type:             Multiprocessor Free
Registered Owner:          Andres
Registered Organization:
Product ID:                00371-153-6150126-85809
Original Install Date:     2/18/2013, 10:21:17 PM
System Boot Time:          1/31/2017, 9:22:30 PM
System Manufacturer:       To Be Filled By O.E.M.
System Model:              To Be Filled By O.E.M.
System Type:               x64-based PC
Processor(s):              1 Processor(s) Installed.
                           [01]: AMD64 Family 16 Model 4 Stepping 2 AuthenticAMD ~3000 Mhz
BIOS Version:              American Megatrends Inc. P1.90, 5/24/2010
Windows Directory:         C:\Windows
System Directory:          C:\Windows\system32
Boot Device:               \Device\HarddiskVolume3
System Locale:             en-us;English (United States)
Input Locale:              en-us;English (United States)
Time Zone:                 (UTC-08:00) Pacific Time (US & Canada)
.....
```

```shell
> wmic memphysical get MaxCapacity
MaxCapacity
16777216
```


```shell
> wmic baseboard list /format:LIST


ConfigOptions=
Depth=
Description=Base Board
Height=
HostingBoard=TRUE
HotSwappable=FALSE
InstallDate=
Manufacturer=ASRock
Model=
Name=Base Board
OtherIdentifyingInfo=
PartNumber=
PoweredOn=TRUE
Product=A780FullDisplayPort
Removable=FALSE
Replaceable=TRUE
RequiresDaughterBoard=FALSE
SpecialRequirements=
Status=OK
Tag=Base Board
```

### Network
On linux `tcpdump` and `netstat` are gold but on Windows the you have different tools. Well, there is netstat, but it's different.


- <https://blogs.technet.microsoft.com/mrsnrub/2009/09/10/capturing-network-traffic-in-windows-7-server-2008-r2/>

Instead of `tcpdump` you can use `netsh` to capture traffic
```
netsh trace start capture=yes
netsh trace stop
```

```powershell
Get-WmiObject Win32_IP4RouteTable | Format-Table -Wrap -Property Age,Caption,Mask,Destination,Name
```

```
> netsh int show int

Admin State    State          Type             Interface Name
-------------------------------------------------------------------------
Enabled        Connected      Dedicated        VirtualBox Host-Only Network
Enabled        Connected      Dedicated        Npcap Loopback Adapter
Enabled        Connected      Dedicated        VirtualBox Host-Only Network #2
Enabled        Connected      Dedicated        VirtualBox Host-Only Network #3
Enabled        Connected      Dedicated        Ethernet 2
Enabled        Connected      Dedicated        vEthernet (DockerNAT)
```


Quickly find gateway address
```shell
> netsh interface ip show config | findstr "Default"
    Default Gateway:                      10.15.128.1
```

Let's find DNS!
```shell
> netsh interface ip show config | findstr "DNS"
    DNS servers configured through DHCP:  10.8.1.90
    Statically Configured DNS Servers:    192.168.1.104
    Statically Configured DNS Servers:    None
    Statically Configured DNS Servers:    None
    Statically Configured DNS Servers:    None
    Statically Configured DNS Servers:    None
```

```shell
> netsh interface ipv4 show tcpconnections

MIB-II TCP Connection Entry
Local Address   Local Port      Remote Address  Remote Port     State
-----------------------------------------------------------------------------
        0.0.0.0       22               0.0.0.0          0       Listen
        0.0.0.0      135               0.0.0.0          0       Listen
      10.0.75.1      139               0.0.0.0          0       Listen
  10.15.130.204      139               0.0.0.0          0       Listen
 169.254.54.117      139               0.0.0.0          0       Listen
      127.0.0.1     2201               0.0.0.0          0       Listen
      127.0.0.1     2202             127.0.0.1      10240  Established
      127.0.0.1     2202             127.0.0.1      13370  Established
      127.0.0.1     2202               0.0.0.0          0       Listen
      127.0.0.1     2222             127.0.0.1      14513  Established
      127.0.0.1     2222               0.0.0.0          0       Listen
  10.15.130.204     3144         65.52.108.195        443  Established
```

**netstat** which is familiar is on Windows!

```shell
> netstat -ab

Active Connections

  Proto  Local Address          Foreign Address        State
  TCP    0.0.0.0:22             console-10:0           LISTENING
  SshProxy
 [svchost.exe]
  TCP    0.0.0.0:135            console-10:0           LISTENING
  RpcSs
 [svchost.exe]
  TCP    0.0.0.0:445            console-10:0           LISTENING
 Can not obtain ownership information
  TCP    0.0.0.0:1536           console-10:0           LISTENING
 Can not obtain ownership information
  TCP    0.0.0.0:1537           console-10:0           LISTENING
  EventLog
 [svchost.exe]
```

```shell
> netstat -ao

Active Connections

  Proto  Local Address          Foreign Address        State           PID
  TCP    0.0.0.0:22             console-10:0           LISTENING       2720
  TCP    0.0.0.0:135            console-10:0           LISTENING       892
  TCP    0.0.0.0:445            console-10:0           LISTENING       4
  TCP    0.0.0.0:1536           console-10:0           LISTENING       592
  TCP    0.0.0.0:1537           console-10:0           LISTENING       372
  TCP    0.0.0.0:1538           console-10:0           LISTENING       1332
  TCP    0.0.0.0:1539           console-10:0           LISTENING       2024
  TCP    0.0.0.0:1541           console-10:0           LISTENING       732
  TCP    0.0.0.0:1550           console-10:0           LISTENING       748
  TCP    0.0.0.0:2179           console-10:0           LISTENING       2680
  TCP    0.0.0.0:3389           console-10:0           LISTENING       292
```

### Processes
You need to be able to quickly check processes for anything phishy!
```shell
> schtasks

Folder: \
TaskName                                 Next Run Time          Status
======================================== ====================== ===============
G2MUpdateTask-S-1-5-21-3622734366-314535 2/10/2017 4:07:00 PM   Ready
G2MUploadTask-S-1-5-21-3622734366-314535 2/10/2017 4:31:00 PM   Ready
GoogleUpdateTaskMachineCore              2/11/2017 1:58:09 PM   Ready
GoogleUpdateTaskMachineUA                2/10/2017 3:58:09 PM   Ready
klcp_update                              2/25/2017 7:10:00 PM   Ready
OneDrive Standalone Update Task v2       2/11/2017 4:41:36 PM   Ready
RtHDVBg_LENOVO_MICPKEY                   N/A                    Running
RTKCPL                                   N/A                    Running

Folder: \Microsoft
TaskName                                 Next Run Time          Status
======================================== ====================== ===============
INFO: There are no scheduled tasks presently available at your access level.

Folder: \Microsoft\Office
TaskName                                 Next Run Time          Status
======================================== ====================== ===============
Office Automatic Updates                 2/12/2017 4:01:03 AM   Ready
Office ClickToRun Service Monitor        2/11/2017 8:58:46 AM   Ready
Office Subscription Maintenance          2/11/2017 8:25:18 AM   Ready
OfficeTelemetryAgentFallBack2016         N/A                    Ready
OfficeTelemetryAgentLogOn2016            N/A                    Ready

Folder: \Microsoft\Windows
TaskName                                 Next Run Time          Status
======================================== ====================== ===============
INFO: There are no scheduled tasks presently available at your access level.

.....
```


```shell
> tasklist                                                                        
                                                                                  
Image Name                     PID Session Name        Session#    Mem Usage      
========================= ======== ================ =========== ============      
System Idle Process              0 Services                   0          4 K      
System                           4 Services                   0         32 K      
smss.exe                       324 Services                   0        336 K      
csrss.exe                      500 Services                   0      1,592 K      
wininit.exe                    592 Services                   0        836 K      
csrss.exe                      600 Console                    1      3,972 K      
winlogon.exe                   680 Console                    1      3,116 K      
services.exe                   732 Services                   0      4,660 K      
lsass.exe                      748 Services                   0     10,104 K      
svchost.exe                    840 Services                   0     10,992 K      
svchost.exe                    892 Services                   0      8,520 K      
svchost.exe                    292 Services                   0     19,944 K      
svchost.exe                    372 Services                   0     17,176 K      
svchost.exe                    384 Services                   0     15,152 K      
svchost.exe                   1104 Services                   0     15,980 K      
nvvsvc.exe                    1140 Services                   0      3,424 K      
nvSCPAPISvr.exe               1148 Services                   0      2,136 K      
svchost.exe                   1180 Services                   0     18,308 K      
svchost.exe                   1332 Services                   0     64,384 K      
nvxdsync.exe                  1380 Console                    1     13,292 K      
nvvsvc.exe                    1452 Console                    1      7,852 K      
svchost.exe                   1960 Services                   0      7,104 K      
svchost.exe                   2004 Services                   0      1,960 K      
spoolsv.exe                   2024 Services                   0      8,512 K      
svchost.exe                   2236 Services                   0     23,336 K      
com.docker.service            2252 Services                   0      2,552 K      
dirmngr.exe                   2280 Services                   0      1,568 K      
IpOverUsbSvc.exe              2296 Services                   0      2,576 K      
.....
```

