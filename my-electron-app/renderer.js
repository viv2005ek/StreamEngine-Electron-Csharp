// Ensure we only grab elements once
const logElement = document.getElementById("log");
const pickBtn = document.getElementById("pick");

if (pickBtn) {
    pickBtn.addEventListener("click", async () => {
        try {
            // 1. Reset UI State
            logElement.innerText = "Opening file picker...";
            document.getElementById('speed-val').innerText = "0 MB/s";
            document.getElementById('mem-val').innerText = "0 MB";
            document.getElementById('time-val').innerText = "0.00s";

            // 2. Call the API
            const result = await window.api.pickAndRun();
            
            if (result && result.output) {
                parseAndUpdateUI(result.output);
            } else {
                logElement.innerText = "Selection cancelled or no output received.";
            }
        } catch (err) {
            logElement.innerText = "Error: " + err.message;
            console.error(err);
        }
    });
}

function parseAndUpdateUI(text) {
    if (!logElement) return;
    
    logElement.innerText = text; 
    logElement.scrollTop = logElement.scrollHeight;

    const lines = text.split('\n');
    
    lines.forEach(line => {
        // 1. Progress (Captures 00.00%)
        const progressMatch = line.match(/Progress:\s+([\d.]+)%/);
        if (progressMatch) {
            const percent = progressMatch[1];
        }

        // 2. Throughput (Handles commas like 1,673.61)
        const speedMatch = line.match(/(?:Throughput|Avg Throughput):\s+([\d,.]+)/);
        if (speedMatch) {
            document.getElementById('speed-val').innerText = `${speedMatch[1]} MB/s`;
        }

        // 3. Memory (Handles Peak/Final/Start)
        const memMatch = line.match(/Memory(?:\s\(\w+\))?:\s+([\d,.]+)/);
        if (memMatch) {
            document.getElementById('mem-val').innerText = `${memMatch[1]} MB`;
        }

        // 4. Total Time
        const timeMatch = line.match(/Total Time:\s+([\d.]+)/);
        if (timeMatch) {
            document.getElementById('time-val').innerText = `${timeMatch[1]}s`;
        }

        // 5. File Name
        const pathMatch = line.match(/File Path:\s+(.*)/);
        if (pathMatch) {
            const fileName = pathMatch[1].trim().split(/[\\\/]/).pop();
            document.getElementById('file-name').innerText = fileName;
        }
    });
}