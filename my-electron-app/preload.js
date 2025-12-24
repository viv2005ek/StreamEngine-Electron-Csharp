const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    pickAndRun: (useStdin) =>
        ipcRenderer.invoke("pick-and-run", useStdin)
});
