const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 650,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    win.loadFile("index.html");
}

ipcMain.handle("pick-and-run", async (_, useStdin) => {
    const result = await dialog.showOpenDialog({
        properties: ["openFile"]
    });

    if (result.canceled) {
        return { output: "No file selected.\n" };
    }

    const filePath = result.filePaths[0];

const platform = process.platform;

let rid;
let exeName = "LargeFileStreamReader";

if (platform === "win32") {
    rid = "win-x64";
    exeName += ".exe";
} else if (platform === "darwin") {
    // change to osx-x64 if on Intel Mac
    rid = "osx-arm64";
} else if (platform === "linux") {
    rid = "linux-x64";
} else {
    throw new Error("Unsupported OS");
}

const exePath = path.join(
    __dirname,
    "..",
    "LargeFileStreamReader",
    "bin",
    "Release",
    "net9.0",
    rid,
    "publish",
    exeName
);


    return new Promise((resolve) => {
        let output = "";
        let child;

        if (useStdin) {
            // ============================
            // PLAN B — Stream via STDIN
            // ============================
            child = spawn(exePath, ["--stdin"]);

            const readStream = fs.createReadStream(filePath, {
                highWaterMark: 16 * 1024 * 1024 // 16 MB chunks
            });

            readStream.pipe(child.stdin);
        } else {
            // ============================
            // PLAN A — File path only
            // ============================
            child = spawn(exePath, [filePath]);
        }

        child.stdout.on("data", (data) => {
            output += data.toString();
        });

        child.stderr.on("data", (data) => {
            output += "\nERROR:\n" + data.toString();
        });

        child.on("close", () => {
            resolve({ output });
        });
    });
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
