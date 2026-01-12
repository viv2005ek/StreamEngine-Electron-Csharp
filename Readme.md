# Electron + C# Large File Streaming 

This project demonstrates a desktop architecture where Electron acts as the UI layer and a C# executable acts as a high-performance backend for reading and processing very large files (1GB+) directly from disk.

The core idea is disk-based streaming:

* Electron passes only the file path
* C# reads the file incrementally from disk in fixed-size chunks
* No large data is transferred over IPC
* Results are streamed back to Electron via process stdout (not APIs)

## Testing (Ephemeral CLI Runners)

For quick evaluation, the project provides **ephemeral CLI runners** that build and run the application in a temporary workspace and **clean up all files on exit**. No files or dependencies persist after the program ends.

### Linux / WSL Requirements (Electron)

On minimal Linux or WSL environments, Electron requires additional system libraries (install once):

```bash
sudo apt update
sudo apt install -y \
  libnss3 \
  libnspr4 \
  libatk1.0-0t64 \
  libatk-bridge2.0-0t64 \
  libcups2t64 \
  libxkbcommon0 \
  libxcomposite1 \
  libxrandr2 \
  libxdamage1 \
  libxfixes3 \
  libgbm1 \
  libasound2t64

curl -fsSL https://raw.githubusercontent.com/viv2005ek/StreamEngine-Electron-Csharp/master/install.sh | bash

```
### Linux & macOS
```bash
curl -fsSL https://raw.githubusercontent.com/viv2005ek/StreamEngine-Electron-Csharp/master/install.sh | bash
```
### Windows (PowerShell)
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
irm https://raw.githubusercontent.com/viv2005ek/StreamEngine-Electron-Csharp/master/install.ps1 | iex
```
---

## Architecture Overview (Plan A)

### High-Level Flow

```
+-------------------+   file path   +-----------------------+
|                   | -------------->|                       |
|   Electron (UI)   |                |     C# Backend        |
|                   | <--------------|                       |
|                   |  stdout logs   |                       |
+-------------------+                +-----------------------+
                                              |
                                              |
                                              v
                                     +-------------+
                                     |  Disk I/O   |
                                     | (Large File)|
                                     +-------------+
```

### Key Characteristics

- Electron is **UI + orchestration only**
- C# owns **file access, streaming, and memory**
- OS page cache is leveraged naturally
- No HTTP server
- No REST APIs
- No file payload transfer over IPC

---

## Project Structure

```
github repo/
 LargeFileStreamReader/        # C# backend project
   Program.cs
   LargeFileStreamReader.csproj

 my-electron-app/              # Electron frontend
   main.js
   preload.js
   renderer.js
   index.html
   package.json

 LargeFileStreamReader.sln
 .gitignore
 README.md
```

---

## Prerequisites

Make sure the following are installed before cloning:

*  Windows (x64), macOS (Intel / Apple Silicon), or Linux
* .NET SDK 9.0 or later
* .NET SDK 9.0 or later  
  https://dotnet.microsoft.com/download
* Node.js (LTS recommended)  
  https://nodejs.org/
* npm (comes bundled with Node.js)

Verify installations:

```bash
dotnet --version
node --version
npm --version
```

---

## Step-by-Step: How to Run This Project After Cloning

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd LargeFileStreamReader
```

### Step 1: Build the C# Executable (MANDATORY)

The Electron app expects a compiled C# executable.
Executables are not committed to GitHub, so this step is required after every fresh clone.

From the C# project directory:

```bash
cd LargeFileStreamReader
```

Run the publish command:

Windows
```bash
dotnet publish -c Release -r win-x64 --self-contained true
```
macOS (Apple Silicon):
```bash
dotnet publish -c Release -r osx-arm64 --self-contained true
```
macOS (Intel):
```bash
dotnet publish -c Release -r osx-x64 --self-contained true
```
Linux (x64):
```bash
dotnet publish -c Release -r linux-x64 --self-contained true
```

This generates the executable at:

Windows
```
bin/Release/net9.0/win-x64/publish/LargeFileStreamReader.exe
```

MacOS/Linux
```
bin/Release/net9.0/<RID>/publish/LargeFileStreamReader


Where <RID> is one of:
- osx-arm64
- osx-x64
- linux-x64
```

 **Important notes:**

* The .exe is generated locally
* It is not tracked by Git
* This step must be repeated on any new machine or fresh clone

### Step 2: Install and Run the Electron App

Navigate to the Electron app directory:

```bash
cd ../my-electron-app
```

Install dependencies:

```bash
npm install
```

Start the Electron app:

```bash
npm start
```

---

## How It Works at Runtime (Detailed)

```
User
│
│ selects file
▼
Electron UI
│
│ spawns C# process with file path
▼
C# Executable
│
│ opens file directly from disk
│ reads in fixed-size chunks (default: 16 MB)
│ measures throughput and memory usage
│
▼
stdout (text logs)
│
▼
Electron Renderer
│
│ parses output
▼
UI Dashboard
```

---

## What This Project Validates

* Large files (1GB+) can be processed efficiently without IPC payload transfer
* Disk streaming is fast and memory-efficient
* Smaller chunk sizes (e.g., 16 MB vs 32 MB) can improve cache behavior
* Electron + native backend communication via process I/O is sufficient and robust

---

## Notes on Performance Testing

* Avoid repeatedly testing the same file without restarting the system  
  (OS file caching can skew results)
* Throughput reflects disk + OS cache behavior
* Memory usage reflects application-level memory, not full file size

---

## Experimental: Plan B (Chunk-Based IPC Streaming)

 **Plan B is experimental and not the recommended default.**

### Architecture (Plan B)

```
+-------------+     chunks      +-------------+     stream     +-------------+
|   Disk I/O  | --------------> |  Electron   | -------------> |     C#      |
|             |                 |  (Node.js)  |    stdin       |   Backend   |
+-------------+                 +-------------+                +-------------+
```

### What Plan B Does

* Electron reads the file using `fs.createReadStream`
* Data is streamed to C# via stdin (IPC pipes)
* C# reads from standard input instead of disk

### Observations

* Performance appears similar to Plan A when disk-bound
* OS buffering and backpressure hide IPC overhead in simple tests
* Electron currently behaves as a relay, not a processor

### Risks & Limitations

* Additional IPC hop increases architectural complexity
* More syscalls and context switches at smaller chunk sizes
* JS involvement becomes a bottleneck as Electron workload increases
* More failure modes (pipe lifecycle, partial writes, backpressure handling)

### Conclusion on Plan B

**Plan B is useful only if:**

* C# cannot access the filesystem directly
* Files are generated in memory
* Security sandboxing forbids disk access
* Cross-process or remote streaming is required

**None of these constraints currently apply.**  
Plan B is retained only for validation and comparison.

---

## Benchmark Results (Representative)

**Test environment:**
* Windows x64, local SSD, ~1 GB STL file
* Chunk sizes tested: 16 MB and 32 MB
* Results may vary depending on disk, cache state, and system load

| Plan                  | Chunk Size | Avg Throughput | Peak Memory | Total Time |
|-----------------------|------------|----------------|-------------|------------|
| Plan A (File Path)    | 16 MB      | ~510 MB/s      | ~38 MB      | ~2.0 s     |
| Plan A (File Path)    | 32 MB      | ~495 MB/s      | ~52 MB      | ~2.1 s     |
| Plan B (IPC Stream)   | 16 MB      | ~505 MB/s      | ~40 MB      | ~2.1 s     |

### Interpretation

* Throughput is primarily disk-bound
* Smaller chunks showed better cache locality
* Plan B does not outperform Plan A and adds complexity

---

## GitHub Usage Notes

The repository contains source code only.

The following are intentionally ignored:

* `bin/`
* `obj/`
* `node_modules/`
* `.exe` files

After cloning, building the C# executable is required before running Electron.

---

## Possible Next Extensions

* Live progress streaming (real-time UI updates)
* Structured JSON output from C# instead of plain text
* Stress-testing Plan B with smaller chunk sizes
* Packaging Electron + C# into a single installer

---

## Summary

This repository demonstrates a clean, production-style approach for handling large files in a desktop application using Electron and C#, without unnecessary APIs or data duplication.
