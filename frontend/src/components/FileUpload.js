import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [trimmedVideos, setTrimmedVideos] = useState([]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('video', file);

        try {
            const response = await axios.post('http://localhost:3002/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setTrimmedVideos(response.data.trimmedVideos);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div>
            <input type='file' onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            <div>
                {trimmedVideos.map((video, index) => (
                    <div key={index}>
                        <video src={video.url} controls />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileUpload;
