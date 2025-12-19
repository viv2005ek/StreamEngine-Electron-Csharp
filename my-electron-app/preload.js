const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  pickAndRun: () => ipcRenderer.invoke("pick-and-run")
});
