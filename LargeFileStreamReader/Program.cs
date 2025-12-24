using System;
using System.Diagnostics;
using System.IO;

namespace LargeFileStreamReader
{
    class Program
    {
        private const int CHUNK_SIZE_MB = 16;
        private const int MEMORY_LOG_INTERVAL = 50;

        static int Main(string[] args)
        {
            try
            {
                int chunkSize = CHUNK_SIZE_MB * 1024 * 1024;

                // ===============================
                // MODE B: Read file from STDIN
                // ===============================
                if (args.Length == 1 && args[0] == "--stdin")
                {
                    ProcessStreamFromStdin(chunkSize);
                    return 0;
                }

                // ===============================
                // MODE A: Read file from DISK (existing behavior)
                // ===============================
                if (args.Length < 1)
                {
                    Console.Error.WriteLine("ERROR: File path not provided.");
                    return 1;
                }

                string filePath = args[0];

                if (!File.Exists(filePath))
                {
                    Console.Error.WriteLine($"ERROR: File not found: {filePath}");
                    return 1;
                }

                ProcessLargeFile(filePath, chunkSize);
                return 0;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine("ERROR: " + ex.Message);
                Console.Error.WriteLine(ex.StackTrace);
                return 2;
            }
        }

        // =========================================================
        // ORIGINAL FILE-BASED IMPLEMENTATION (UNCHANGED)
        // =========================================================
        static void ProcessLargeFile(string filePath, int chunkSize)
        {
            FileInfo fileInfo = new FileInfo(filePath);
            long fileSize = fileInfo.Length;
            double fileSizeMB = fileSize / (1024.0 * 1024.0);

            Console.WriteLine($"File Path:       {filePath}");
            Console.WriteLine($"File Size:       {fileSize:N0} bytes ({fileSizeMB:F2} MB)");
            Console.WriteLine($"Chunk Size:      {chunkSize / (1024.0 * 1024.0):F2} MB");
            Console.WriteLine($"Memory (Start):  {GetMemoryUsageMB():F2} MB");
            Console.WriteLine("\nStarting incremental read...\n");

            byte[] buffer = new byte[chunkSize];
            long totalBytesRead = 0;
            int chunkCount = 0;
            double maxMemoryMB = GetMemoryUsageMB();

            Stopwatch stopwatch = Stopwatch.StartNew();

            using (FileStream fs = new FileStream(
                filePath,
                FileMode.Open,
                FileAccess.Read,
                FileShare.Read,
                bufferSize: 64 * 1024,
                useAsync: false))
            {
                int bytesRead;
                while ((bytesRead = fs.Read(buffer, 0, buffer.Length)) > 0)
                {
                    totalBytesRead += bytesRead;
                    chunkCount++;

                    if (chunkCount % MEMORY_LOG_INTERVAL == 0)
                    {
                        double currentMemoryMB = GetMemoryUsageMB();
                        maxMemoryMB = Math.Max(maxMemoryMB, currentMemoryMB);

                        double progress = (totalBytesRead / (double)fileSize) * 100.0;
                        double elapsedSec = stopwatch.Elapsed.TotalSeconds;
                        double throughput = (totalBytesRead / (1024.0 * 1024.0)) / elapsedSec;

                        Console.WriteLine(
                            $"Progress: {progress,6:F2}% | " +
                            $"Chunks: {chunkCount,6} | " +
                            $"Memory: {currentMemoryMB,7:F2} MB | " +
                            $"Throughput: {throughput,8:F2} MB/s"
                        );
                    }
                }
            }

            stopwatch.Stop();

            double finalMemoryMB = GetMemoryUsageMB();
            maxMemoryMB = Math.Max(maxMemoryMB, finalMemoryMB);

            Console.WriteLine("\n=== Results ===");
            Console.WriteLine($"Total Bytes Read: {totalBytesRead:N0} bytes");
            Console.WriteLine($"Total Chunks:     {chunkCount:N0}");
            Console.WriteLine($"Total Time:       {stopwatch.Elapsed.TotalSeconds:F2} sec");
            Console.WriteLine($"Avg Throughput:   {(totalBytesRead / (1024.0 * 1024.0)) / stopwatch.Elapsed.TotalSeconds:F2} MB/s");
            Console.WriteLine($"Memory (Peak):    {maxMemoryMB:F2} MB");
            Console.WriteLine($"Memory (Final):   {finalMemoryMB:F2} MB");

            if (totalBytesRead == fileSize)
            {
                Console.WriteLine("\n✓ File read successfully (all bytes processed)");
            }
            else
            {
                Console.WriteLine($"\n⚠ Warning: Expected {fileSize:N0} bytes, read {totalBytesRead:N0} bytes");
            }
        }

        // =========================================================
        // NEW: STDIN STREAMING IMPLEMENTATION (PLAN B)
        // =========================================================
        static void ProcessStreamFromStdin(int chunkSize)
        {
            Console.WriteLine("Source:          STDIN");
            Console.WriteLine($"Chunk Size:      {chunkSize / (1024.0 * 1024.0):F2} MB");
            Console.WriteLine($"Memory (Start):  {GetMemoryUsageMB():F2} MB");
            Console.WriteLine("\nStarting incremental read...\n");

            byte[] buffer = new byte[chunkSize];
            long totalBytesRead = 0;
            int chunkCount = 0;
            double maxMemoryMB = GetMemoryUsageMB();

            Stopwatch stopwatch = Stopwatch.StartNew();
            Stream input = Console.OpenStandardInput();

            int bytesRead;
            while ((bytesRead = input.Read(buffer, 0, buffer.Length)) > 0)
            {
                totalBytesRead += bytesRead;
                chunkCount++;

                if (chunkCount % MEMORY_LOG_INTERVAL == 0)
                {
                    double currentMemoryMB = GetMemoryUsageMB();
                    maxMemoryMB = Math.Max(maxMemoryMB, currentMemoryMB);

                    double elapsedSec = stopwatch.Elapsed.TotalSeconds;
                    double throughput = (totalBytesRead / (1024.0 * 1024.0)) / elapsedSec;

                    Console.WriteLine(
                        $"Chunks: {chunkCount,6} | " +
                        $"Memory: {currentMemoryMB,7:F2} MB | " +
                        $"Throughput: {throughput,8:F2} MB/s"
                    );
                }
            }

            stopwatch.Stop();

            double finalMemoryMB = GetMemoryUsageMB();
            maxMemoryMB = Math.Max(maxMemoryMB, finalMemoryMB);

            Console.WriteLine("\n=== Results ===");
            Console.WriteLine($"Total Bytes Read: {totalBytesRead:N0} bytes");
            Console.WriteLine($"Total Chunks:     {chunkCount:N0}");
            Console.WriteLine($"Total Time:       {stopwatch.Elapsed.TotalSeconds:F2} sec");
            Console.WriteLine($"Avg Throughput:   {(totalBytesRead / (1024.0 * 1024.0)) / stopwatch.Elapsed.TotalSeconds:F2} MB/s");
            Console.WriteLine($"Memory (Peak):    {maxMemoryMB:F2} MB");
            Console.WriteLine($"Memory (Final):   {finalMemoryMB:F2} MB");
        }

        static double GetMemoryUsageMB()
        {
            return Process.GetCurrentProcess().WorkingSet64 / (1024.0 * 1024.0);
        }
    }
}
