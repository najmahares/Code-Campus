import { writeFile } from "node:fs/promises";

const BASE = "https://raw.githubusercontent.com/btahir/open-lofi/main/tracks";

const tracks = [
  ["focus-01", "ambient-lofi", "almost-floating.mp3"],
  ["focus-02", "ambient-lofi", "aurora-on-mute.mp3"],
  ["focus-03", "ambient-lofi", "deep-space-loop.mp3"],
  ["focus-04", "ambient-lofi", "orbiting-in-silence.mp3"],
  ["calm-01",  "seasonal-weather", "petals-after-rain.mp3"],
  ["calm-02",  "seasonal-weather", "storm-over-side-streets.mp3"],
  ["calm-03",  "seasonal-weather", "winter-turntable.mp3"],
  ["calm-04",  "seasonal-weather", "mist-over-green-fields.mp3"],
  ["sleep-01", "ambient-lofi", "blue-below-the-surface.mp3"],
  ["sleep-02", "ambient-lofi", "misty-mountain-sunrise.mp3"],
  ["sleep-03", "ambient-lofi", "moonlit-moss.mp3"],
  ["sleep-04", "ambient-lofi", "satellite-lullaby.mp3"],
];

for (const [out, category, file] of tracks) {
  const url = BASE + "/" + category + "/" + file;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 10000) throw new Error("too small, likely 404 page");
    await writeFile("public/audio/" + out + ".mp3", buf);
    console.log("OK  " + out + ".mp3  (" + Math.round(buf.length / 1024) + " KB)");
  } catch (err) {
    console.log("SKIP " + out + " — " + err.message + "  (" + url + ")");
  }
}
console.log("\nDone. Check public/audio/");
