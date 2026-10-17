#!/bin/bash
set -e

ZIP_URL="https://github.com/btahir/open-lofi/releases/latest/download/openlofi.zip"
TMP="/tmp/openlofi"
mkdir -p "$TMP"
mkdir -p public/audio

echo "Downloading Open Lo-Fi zip (about 500MB)..."
curl -L -o "$TMP/openlofi.zip" "$ZIP_URL"

echo "Extracting..."
unzip -q "$TMP/openlofi.zip" -d "$TMP"

TRACKS="$TMP/tracks"
if [ ! -d "$TRACKS" ]; then
  echo "Tracks folder not found. Contents of $TMP:"
  ls "$TMP"
  exit 1
fi

# Focus — ambient, weightless, no beats fighting you
cp "$TRACKS/ambient-lofi/almost-floating.mp3"        public/audio/focus-01.mp3
cp "$TRACKS/ambient-lofi/aurora-on-mute.mp3"         public/audio/focus-02.mp3
cp "$TRACKS/ambient-lofi/deep-space-loop.mp3"        public/audio/focus-03.mp3
cp "$TRACKS/ambient-lofi/orbiting-in-silence.mp3"    public/audio/focus-04.mp3

# Calm — rain, seasons, gentle textures
cp "$TRACKS/seasonal-weather/petals-after-rain.mp3"      public/audio/calm-01.mp3
cp "$TRACKS/seasonal-weather/storm-over-side-streets.mp3" public/audio/calm-02.mp3
cp "$TRACKS/seasonal-weather/winter-turntable.mp3"        public/audio/calm-03.mp3
cp "$TRACKS/seasonal-weather/mist-over-green-fields.mp3"  public/audio/calm-04.mp3

# Sleep — deep ambient, long, slow
cp "$TRACKS/ambient-lofi/blue-below-the-surface.mp3"   public/audio/sleep-01.mp3
cp "$TRACKS/ambient-lofi/misty-mountain-sunrise.mp3"   public/audio/sleep-02.mp3
cp "$TRACKS/ambient-lofi/moonlit-moss.mp3"             public/audio/sleep-03.mp3
cp "$TRACKS/ambient-lofi/satellite-lullaby.mp3"        public/audio/sleep-04.mp3

echo ""
echo "Done. Files in public/audio/:"
ls -la public/audio/*.mp3

rm -rf "$TMP"
echo ""
echo "Cleaned up temp files."
