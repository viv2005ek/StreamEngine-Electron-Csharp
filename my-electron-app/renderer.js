const logElement = document.getElementById("log");
const pickBtn = document.getElementById("pick");

pickBtn.addEventListener("click", async () => {
    try {
        // Reset UI
        logElement.innerText = "Opening file picker...";
        document.getElementById("speed-val").innerText = "0 MB/s";
        document.getElementById("mem-val").innerText = "0 MB";
        document.getElementById("time-val").innerText = "0.00s";
        document.getElementById("file-name").innerText = "No file selected";

        const useStdin = document.getElementById("use-stdin").checked;

        const result = await window.api.pickAndRun(useStdin);

        if (result && result.output) {
            parseAndUpdateUI(result.output);
        } else {
            logElement.innerText = "No output received.";
        }
    } catch (err) {
        logElement.innerText = "Error: " + err.message;
    }
});

function parseAndUpdateUI(text) {
    logElement.innerText = text;
    logElement.scrollTop = logElement.scrollHeight;

    const lines = text.split("\n");

    lines.forEach((line) => {
        // File name
        const fileMatch = line.match(/File Path:\s+(.*)/);
        if (fileMatch) {
            const fileName = fileMatch[1].split(/[\\/]/).pop();
            document.getElementById("file-name").innerText = fileName;
        }

        // Throughput
        const speedMatch = line.match(/(?:Throughput|Avg Throughput):\s+([\d,.]+)/);
        if (speedMatch) {
            document.getElementById("speed-val").innerText =
                `${speedMatch[1]} MB/s`;
        }

        // Memory
        const memMatch = line.match(/Memory(?:\s\(\w+\))?:\s+([\d,.]+)/);
        if (memMatch) {
            document.getElementById("mem-val").innerText =
                `${memMatch[1]} MB`;
        }

        // Total Time
        const timeMatch = line.match(/Total Time:\s+([\d.]+)/);
        if (timeMatch) {
            document.getElementById("time-val").innerText =
                `${timeMatch[1]}s`;
        }
    });
}
