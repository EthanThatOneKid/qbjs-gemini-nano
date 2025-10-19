if (import.meta.main) {
  await downloadSamples();
}

interface Sample {
  input: string;
  output: string;
}

async function downloadSamples() {
  const samples: Sample[] = [];
  const samplesResponse = await fetch(
    "https://raw.githubusercontent.com/boxgaming/qbjs-samples/refs/heads/main/samples.txt",
  );
  const samplesText = await samplesResponse.text();
  for (const { 0: filename, 3: description } of parseSamples(samplesText)) {
    if (!filename.endsWith(".bas")) {
      continue;
    }

    const response = await fetch(
      `https://raw.githubusercontent.com/boxgaming/qbjs-samples/refs/heads/main/samples/${filename}`,
    );
    const code = await response.text();
    samples.push({ input: description, output: code });
  }

  await Deno.writeTextFile(
    "./src/samples.json",
    JSON.stringify(samples, null, 2) + "\n",
  );
}

function parseSamples(text: string) {
  return text
    .split("\n")
    .map((line) =>
      line
        .split(",")
        .map((cell) => cell.trim())
    );
}
