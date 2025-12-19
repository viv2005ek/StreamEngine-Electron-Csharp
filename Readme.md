 # Electron + C# Large File Streaming (Plan A)

This project demonstrates a desktop architecture where Electron acts as the UI layer and a C# executable acts as a high-performance backend for reading and processing very large files (≈1GB+) directly from disk.

The core idea is disk-based streaming:

* Electron passes only the file path
* C# reads the file incrementally from disk in fixed-size chunks
* No large data is transferred over IPC
* Results are streamed back to Electron via process stdout (not APIs)

## Architecture Overview

Electron (UI)

→ spawns C# executable with file path

→ C# streams file from disk in chunks

→ C# writes progress/results to stdout

→ Electron captures stdout and displays it

No HTTP server. No REST APIs. No file payload transfer.

## Project Structure

```
LargeFileStreamReader/
├─ LargeFileStreamReader/        # C# backend project
│  ├─ Program.cs
│  ├─ LargeFileStreamReader.csproj
│
├─ my-electron-app/              # Electron frontend
│  ├─ main.js
│  ├─ preload.js
│  ├─ renderer.js
│  ├─ index.html
│  ├─ package.json
│
├─ LargeFileStreamReader.sln
├─ .gitignore
└─ README.md
```

## Prerequisites

Make sure the following are installed before cloning:

* Windows (x64)
* .NET SDK 9.0 or later
  * https://dotnet.microsoft.com/download
* Node.js (LTS recommended)
  * https://nodejs.org/
* npm (comes bundled with Node.js)

Verify installations:

```
dotnet --version
node --version
npm --version
```

## Step-by-Step: How to Run This Project After Cloning

1. Clone the Repository

```
git clone <your-repo-url>
cd LargeFileStreamReader
```

### Step 1: Build the C# Executable (MANDATORY)

The Electron app expects a compiled C# executable. Executables are not committed to GitHub, so this step is required after every fresh clone.

From the C# project directory:

```
cd LargeFileStreamReader/LargeFileStreamReader
```

Run the publish command:

```
dotnet publish -c Release -r win-x64 --self-contained true
```

This generates the executable at:

```
bin/Release/net9.0/win-x64/publish/LargeFileStreamReader.exe
```

⚠️ Important notes:

* The .exe is generated locally
* It is not tracked by Git
* This step must be repeated on any new machine or fresh clone

### Step 2: Install and Run the Electron App

Navigate to the Electron app directory:

```
cd ../../my-electron-app
```

Install dependencies:

```
npm install
```

Start the Electron app:

```
npm start
```

## How It Works at Runtime

* Electron application launches
* User selects a file using the file picker
* Electron spawns the C# executable and passes the file path as a command-line argument

C#:

* Opens the file directly from disk
* Reads it incrementally in fixed-size chunks (default: 16 MB)
* Logs progress, throughput, and memory usage to stdout

Electron captures stdout and renders it in the UI

## What This Project Validates

* Large files (≈1GB+) can be processed efficiently without IPC payload transfer
* Disk streaming is fast and memory-efficient
* Smaller chunk sizes (e.g., 16 MB vs 32 MB) can improve cache behavior
* Electron + native backend communication via process I/O is sufficient and robust

## Notes on Performance Testing

* Avoid repeatedly testing the same file without restarting the system (OS file caching can skew results)
* Throughput reflects disk + OS cache behavior
* Memory usage reflects application-level memory, not full file size

## GitHub Usage Notes

The repository contains source code only

The following are intentionally ignored:

* bin/
* obj/
* node_modules/
* .exe files

After cloning, building the C# executable is required before running Electron

## Possible Next Extensions

* Live progress streaming (real-time UI updates)
* Structured JSON output from C# instead of plain text
* Comparison with chunk-based IPC (Plan B)
* Packaging Electron + C# into a single installer

## Summary

This repository demonstrates a clean, production-style approach for handling large files in a desktop application using Electron and C#, without unnecessary APIs or data duplication.
Electron + C# Large File Streaming (Plan A)

This project demonstrates a desktop architecture where Electron acts as the UI layer and a C# executable acts as a high-performance backend for reading and processing very large files (≈1GB+) directly from disk.

The core idea is disk-based streaming:

Electron passes only the file path

C# reads the file incrementally from disk in fixed-size chunks

No large data is transferred over IPC

Results are streamed back to Electron via process stdout (not APIs)

Architecture Overview

Electron (UI)
→ spawns C# executable with file path
→ C# streams file from disk in chunks
→ C# writes progress/results to stdout
→ Electron captures stdout and displays it

No HTTP server. No REST APIs. No file payload transfer.

Project Structure
LargeFileStreamReader/
├─ LargeFileStreamReader/        # C# backend project
│  ├─ Program.cs
│  ├─ LargeFileStreamReader.csproj
│
├─ my-electron-app/              # Electron frontend
│  ├─ main.js
│  ├─ preload.js
│  ├─ renderer.js
│  ├─ index.html
│  ├─ package.json
│
 # Electron + C# Large File Streaming (Plan A)

This project demonstrates a desktop architecture where Electron acts as the UI layer and a C# executable acts as a high-performance backend for reading and processing very large files (≈1GB+) directly from disk.

The core idea is disk-based streaming:

* Electron passes only the file path
* C# reads the file incrementally from disk in fixed-size chunks
* No large data is transferred over IPC
* Results are streamed back to Electron via process stdout (not APIs)

## Architecture Overview

Electron (UI)

→ spawns C# executable with file path

→ C# streams file from disk in chunks

→ C# writes progress/results to stdout

→ Electron captures stdout and displays it

No HTTP server. No REST APIs. No file payload transfer.

## Project Structure

```
LargeFileStreamReader/
├─ LargeFileStreamReader/        # C# backend project
│  ├─ Program.cs
│  ├─ LargeFileStreamReader.csproj
│
├─ my-electron-app/              # Electron frontend
│  ├─ main.js
│  ├─ preload.js
│  ├─ renderer.js
│  ├─ index.html
│  ├─ package.json
│
├─ LargeFileStreamReader.sln
├─ .gitignore
└─ README.md
```

## Prerequisites

Make sure the following are installed before cloning:

* Windows (x64)
* .NET SDK 9.0 or later
	* https://dotnet.microsoft.com/download
* Node.js (LTS recommended)
	* https://nodejs.org/
* npm (comes bundled with Node.js)

Verify installations:

```
dotnet --version
node --version
npm --version
```

## Step-by-Step: How to Run This Project After Cloning

1. Clone the Repository

```
git clone <your-repo-url>
cd LargeFileStreamReader
```

### Step 1: Build the C# Executable (MANDATORY)

The Electron app expects a compiled C# executable.
Executables are not committed to GitHub, so this step is required after every fresh clone.

From the C# project directory:

```
cd LargeFileStreamReader/LargeFileStreamReader
```

Run the publish command:

```
dotnet publish -c Release -r win-x64 --self-contained true
```

This generates the executable at:

```
bin/Release/net9.0/win-x64/publish/LargeFileStreamReader.exe
```

⚠️ Important notes:

# Electron + C# Large File Streaming (Plan A)

This project demonstrates a desktop architecture where Electron acts as the UI layer and a C# executable acts as a high-performance backend for reading and processing very large files (≈1GB+) directly from disk.

The core idea is disk-based streaming:

* Electron passes only the file path
* C# reads the file incrementally from disk in fixed-size chunks
* No large data is transferred over IPC
* Results are streamed back to Electron via process stdout (not APIs)

## Architecture Overview

Electron (UI)

→ spawns C# executable with file path

→ C# streams file from disk in chunks

→ C# writes progress/results to stdout

→ Electron captures stdout and displays it

No HTTP server. No REST APIs. No file payload transfer.

## Project Structure

```
LargeFileStreamReader/
├─ LargeFileStreamReader/        # C# backend project
│  ├─ Program.cs
│  ├─ LargeFileStreamReader.csproj
│
├─ my-electron-app/              # Electron frontend
│  ├─ main.js
│  ├─ preload.js
│  ├─ renderer.js
│  ├─ index.html
│  ├─ package.json
│
├─ LargeFileStreamReader.sln
├─ .gitignore
└─ README.md
```

## Prerequisites

Make sure the following are installed before cloning:

* Windows (x64)
* .NET SDK 9.0 or later
	* https://dotnet.microsoft.com/download
* Node.js (LTS recommended)
	* https://nodejs.org/
* npm (comes bundled with Node.js)

Verify installations:

```
dotnet --version
node --version
npm --version
```

## Step-by-Step: How to Run This Project After Cloning

1. Clone the Repository

```
git clone <your-repo-url>
cd LargeFileStreamReader
```

### Step 1: Build the C# Executable (MANDATORY)

The Electron app expects a compiled C# executable.
Executables are not committed to GitHub, so this step is required after every fresh clone.

From the C# project directory:

```
cd LargeFileStreamReader/LargeFileStreamReader
```

Run the publish command:

```
dotnet publish -c Release -r win-x64 --self-contained true
```

This generates the executable at:

```
bin/Release/net9.0/win-x64/publish/LargeFileStreamReader.exe
```

⚠️ Important notes:

* The .exe is generated locally
* It is not tracked by Git
* This step must be repeated on any new machine or fresh clone

### Step 2: Install and Run the Electron App

Navigate to the Electron app directory:

```
cd ../../my-electron-app
```

Install dependencies:

```
npm install
```

Start the Electron app:

```
npm start
```

## How It Works at Runtime

* Electron application launches
* User selects a file using the file picker
* Electron spawns the C# executable and passes the file path as a command-line argument

C#:

* Opens the file directly from disk
* Reads it incrementally in fixed-size chunks (default: 16 MB)
* Logs progress, throughput, and memory usage to stdout

Electron captures stdout and renders it in the UI

## What This Project Validates

* Large files (≈1GB+) can be processed efficiently without IPC payload transfer
* Disk streaming is fast and memory-efficient
* Smaller chunk sizes (e.g., 16 MB vs 32 MB) can improve cache behavior
* Electron + native backend communication via process I/O is sufficient and robust

## Notes on Performance Testing

* Avoid repeatedly testing the same file without restarting the system
	(OS file caching can skew results)

* Throughput reflects disk + OS cache behavior

* Memory usage reflects application-level memory, not full file size

## GitHub Usage Notes

The repository contains source code only

The following are intentionally ignored:

* bin/
* obj/
* node_modules/
* .exe files

After cloning, building the C# executable is required before running Electron

## Possible Next Extensions

* Live progress streaming (real-time UI updates)
* Structured JSON output from C# instead of plain text
* Comparison with chunk-based IPC (Plan B)
* Packaging Electron + C# into a single installer

## Summary

This repository demonstrates a clean, production-style approach for handling large files in a desktop application using Electron and C#, without unnecessary APIs or data duplication.
