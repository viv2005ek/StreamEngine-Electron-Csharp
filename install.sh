#!/usr/bin/env bash
set -euo pipefail

echo "Starting ephemeral Electron + C# runner"

# -----------------------------
# Guardrails
# -----------------------------
if [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "cygwin"* ]]; then
  echo "❌ Native Windows is not supported."
  echo "Use macOS/Linux or WSL."
  exit 1
fi

for cmd in git node npm dotnet; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ Missing dependency: $cmd"
    exit 1
  fi
done

# -----------------------------
# Create temp workspace
# -----------------------------
WORKDIR="$(mktemp -d)"
echo "Using temp dir: $WORKDIR"

cleanup() {
  echo "Cleaning up temp files..."
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

# -----------------------------
# Clone repo (TEMP)
# -----------------------------
cd "$WORKDIR"
git clone git clone https://github.com/viv2005ek/StreamEngine-Electron-Csharp.git
cd StreamEngine-Electron-Csharp

# -----------------------------
# Detect OS + RID
# -----------------------------
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Darwin)
    if [[ "$ARCH" == "arm64" ]]; then
      RID="osx-arm64"
    else
      RID="osx-x64"
    fi
    ;;
  Linux)
    RID="linux-x64"
    ;;
  *)
    echo "Unsupported OS: $OS"
    exit 1
    ;;
esac

echo "Detected RID: $RID"

# -----------------------------
# Build C# backend (TEMP)
# -----------------------------
cd LargeFileStreamReader
dotnet publish -c Release -r "$RID" --self-contained true
cd ..

# -----------------------------
# Install Electron deps (TEMP)
# -----------------------------
cd my-electron-app
npm install

# -----------------------------
# Run Electron
# -----------------------------
echo "Launching Electron..."
npm start

# -----------------------------
# When Electron exits:
# - trap runs
# - temp directory is deleted
# -----------------------------
