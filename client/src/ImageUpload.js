import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!image) return alert('Please select an image.');

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData);
      setUploadedUrl(response.data.imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 500, margin: 'auto', padding: 20 }}>
      <h2>Upload Complaint Image</h2>
      <input type="file" onChange={handleImageChange} accept="image/*" />
      <br /><br />
      {previewUrl && <img src={previewUrl} alt="Preview" style={{ width: '100%' }} />}
      <br /><br />
      <button onClick={handleUpload}>Upload</button>
      <br /><br />
      {uploadedUrl && (
        <>
          <p>✅ Uploaded Successfully</p>
          <img src={uploadedUrl} alt="Uploaded" style={{ width: '100%' }} />
        </>
      )}
    </div>
  );
};

export default ImageUpload;
