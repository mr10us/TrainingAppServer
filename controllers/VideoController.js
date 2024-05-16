const fs = require("fs");
const path = require("path");

async function remove(req, res) {
  const { video } = req.query;

  try {
    const [videoPath] = video.split("/").slice(-1);
    const previewPath = videoPath.split(".")[0] + ".jpg";

    fs.unlinkSync(path.resolve(__dirname, "..", "static", "video", videoPath));
    fs.unlinkSync(
      path.resolve(__dirname, "..", "static", "preview", previewPath)
    );

    res.status(204).end();
  } catch (error) {
    console.error("Error removing video:", error);
    res.status(500);
  }
}

module.exports = {
  remove,
};
