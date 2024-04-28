import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("video", file);

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:3002/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data]); // Create a Blob object from the response data
      const url = window.URL.createObjectURL(blob); // Create a URL for the Blob object
      const a = document.createElement("a"); // Create a link element
      a.href = url; // Set the link's href attribute to the Blob URL
      a.download = "downloaded_file.zip"; // Set the download attribute to specify the filename
      document.body.appendChild(a); // Append the link to the document body
      a.click(); // Programmatically click the link to trigger the download
      document.body.removeChild(a);

      setIsLoading(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <div>{isLoading ? "Video proccessing hold" : ""}</div>
    </div>
  );
};

export default FileUpload;
