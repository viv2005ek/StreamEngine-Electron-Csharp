Write-Host "Starting ephemeral Electron + C# runner (Windows)"

# -----------------------------
# Guardrails
# -----------------------------
$required = @("git", "node", "npm", "dotnet")
foreach ($cmd in $required) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Error "Missing dependency: $cmd"
        exit 1
    }
}

# -----------------------------
# Create temp workspace
# -----------------------------
$TempDir = Join-Path $env:TEMP ([System.Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $TempDir | Out-Null
Write-Host "Using temp dir: $TempDir"

function Cleanup {
    Write-Host "Cleaning up temp files..."
    Remove-Item -Recurse -Force $TempDir -ErrorAction SilentlyContinue
}

try {
    # -----------------------------
    # Clone repo (TEMP)
    # -----------------------------
    Set-Location $TempDir
    git clone https://github.com/viv2005ek/StreamEngine-Electron-Csharp.git
    Set-Location StreamEngine-Electron-Csharp

    # -----------------------------
    # Build C# backend (TEMP)
    # -----------------------------
    Set-Location LargeFileStreamReader
    dotnet publish -c Release -r win-x64 --self-contained true
    Set-Location ..

    # -----------------------------
    # Install Electron deps (TEMP)
    # -----------------------------
    Set-Location my-electron-app
    npm ci

    # -----------------------------
    # Run Electron
    # -----------------------------
    Write-Host "Launching Electron..."
    npm start
}
finally {
    Cleanup
}
