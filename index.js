const { Writable } = require("stream");

const outStream = new Writable({
  highWaterMark: 25,
  write(chunk, encoding, callback) {
    setTimeout(() => {
      console.log("write in the outstream: ", chunk.toString());
      callback(); // This is crucial to signal the stream is ready for more data
    }, 10); // Simulate processing time
  },
});

outStream.on("drain", () => {
  console.log("Drain event in consumer");
});

outStream.on("finish", () => {
  console.log("Finish event in consumer");
});

process.stdin.on("data", (chunk) => {
  console.log("Data event in the producer");
});

async function main() {
  let i = 0;
  const limit = 100;

  while (i < limit) {
    const chunk = Buffer.from(`Chunk ${i}`);
    console.log("Writing chunk:", chunk.toString());
    await new Promise((resolve) => setTimeout(resolve, 1));
    const canWrite = outStream.write(chunk); // Returns false when buffer is full
    console.log(`Write result for chunk ${i}:`, canWrite);
    if (!canWrite) {
      console.log("Backpressure applied, waiting for drain...");
      await new Promise((resolve) => outStream.once("drain", resolve));
    }

    i++;
    if (i >= limit) {
      outStream.end(); // Signal the end of the writing process
    }
  }
}

main();
