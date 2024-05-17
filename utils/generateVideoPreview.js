const path = require("path");
const extractFrames = require("ffmpeg-extract-frames");

async function generateVideoPreview(videoName) {
  const videoPath = path.resolve(__dirname, "..", "static/video", videoName);
  const previewPath = path.resolve(
    __dirname,
    "..",
    "static/preview",
    `${videoName.split(".")[0]}.jpg`
  );

  try {
    await extractFrames({
      input: videoPath,
      output: previewPath,
      offsets: [5000] // 5000 ms = 5 seconds
    });
    return previewPath;
  } catch (error) {
    throw error;
  }
}

module.exports = { generateVideoPreview };
