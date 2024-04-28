const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

const PORT = 3002;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('File destination:', 'uploads/'); // Log the destination path
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        console.log('Uploaded file name:', file.originalname); // Log the uploaded file name
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

app.get('/', (req, res) => {
    console.log('working');
});

app.post('/upload', upload.single('video'), (req, res) => {
    const videoPath = req.file.path;
    const outputPath = 'trimmed/';

    console.log(videoPath);

    ffmpeg(videoPath)
        .inputOptions('-c:v copy') // Keep the video codec the same
        .outputOptions('-f segment')
        .outputOptions('-segment_time 45')
        .outputOptions('-reset_timestamps 1')
        .outputOptions('-map 0')
        .output(`${outputPath}vid_%d.mp4`)
        .on('end', () => {
            const trimmedVideos = fs.readdirSync(outputPath).map((fileName) => ({
                name: fileName,
                url: `http://localhost:${PORT}/${outputPath}${fileName}`,
            }));
            res.json({ success: true, trimmedVideos });
        })
        .on('error', (err) => {
            console.error('Error trimming video:', err);
            res.status(500).json({ success: false, error: 'Failed to trim video' });
        })
        .run();
});

app.use(express.static('trimmed'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
