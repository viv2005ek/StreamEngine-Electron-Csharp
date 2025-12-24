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

    const exePath = path.join(
        __dirname,
        "..",
        "LargeFileStreamReader",
        "bin",
        "Release",
        "net9.0",
        "win-x64",
        "publish",
        "LargeFileStreamReader.exe"
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
