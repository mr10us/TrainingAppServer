const fs = require("fs");
const path = require("path");

async function remove(req, res) {
  const { video, image } = req.query;

  try {
    if (video) {
      const videoPath = video.split("/").filter(Boolean).slice(2).join("/");
      const previewPath = videoPath
        .replace("video", "preview")
        .replace(".mp4", ".jpg");

      fs.unlinkSync(path.resolve(__dirname, "..", videoPath));
      fs.unlinkSync(path.resolve(__dirname, "..", previewPath));

      return res.status(204).end();
    }

    if (image) {
      const imagePath = image.split("/").filter(Boolean).slice(2).join("/");

      fs.unlinkSync(path.resolve(__dirname, "..", imagePath));

      return res.status(204).end();
    }
  } catch (error) {
    console.error("Error removing media:", error);
    return res.status(500);
  }
}

module.exports = {
  remove,
};
