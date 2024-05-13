const path = require("path");
const { exec } = require("child_process");

async function generateVideoPreview(videoName) {
  const videoPath = path.resolve(__dirname, "..", "static", "video", videoName);
  const previewPath = path.resolve(
    __dirname,
    "..",
    "static",
    "preview",
    `${videoName}.jpg`
  );
  const command = `ffmpeg -i "${videoPath}" -ss 00:00:03 -vframes 1 "${previewPath}"`;

  try {
    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(previewPath);
        }
      });
    });
    return previewPath;
  } catch (error) {
    throw error;
  }
}

module.exports = { generateVideoPreview };
