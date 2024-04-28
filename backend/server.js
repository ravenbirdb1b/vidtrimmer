const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const archiver = require("archiver");
const fsExtra = require("fs-extra");

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

const PORT = 3002;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("File destination:", "uploads/"); // Log the destination path
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    console.log("Uploaded file name:", file.originalname); // Log the uploaded file name
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  console.log("working");
});

app.post("/upload", upload.single("video"), (req, res) => {
  const videoPath = req.file.path;
  const outputPath = "trimmed/";

  // Create a new zip file
  const zipFilePath = "video_clips.zip";
  const outputZip = fs.createWriteStream(zipFilePath);
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Set compression level
  });

  outputZip.on("close", () => {
    console.log("Zip file created");
    res.download(zipFilePath); // Send the zip file to the client
  });

  outputZip.on("error", (err) => {
    console.error("Error creating zip file:", err);
    res.status(500).send("Error creating zip file");
  });

  archive.pipe(outputZip);

  ffmpeg(videoPath)
    .outputOptions("-c", "copy") // Keep the same codecs
    .outputOptions("-map 0") // Include all streams
    .outputOptions("-segment_time", "45") // Duration of each segment
    .outputOptions("-f", "segment") // Use segment format
    .outputOptions("-reset_timestamps 1") // Reset timestamps for each segment
    .output(`${outputPath}/vid_%d.mp4`) // Output naming convention
    .on("end", () => {
      console.log("Video splitting complete");
      // Add each split video clip to the zip file
      fs.readdir(outputPath, (err, files) => {
        if (err) {
          console.error("Error reading directory:", err);
          return res.status(500).send("Error reading directory");
        }

        files.forEach((file) => {
          archive.file(`${outputPath}/${file}`, { name: file });
        });

        archive.finalize();
      });
    })
    .on("error", (err) => {
      console.error("Error splitting video:", err);
      res.status(500).send("Error splitting video");
    })
    .run();

  // Clear the clips directory before splitting the video
  fsExtra.emptyDirSync(outputPath);
});

app.use(express.static("trimmed"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
