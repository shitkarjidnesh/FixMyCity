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
   <div className="max-w-md mx-auto p-5 bg-white rounded shadow">
  <h2 className="text-xl font-semibold mb-4 text-center">Upload Complaint Image</h2>

  <input
    type="file"
    onChange={handleImageChange}
    accept="image/*"
    className="mb-4 w-full border border-gray-300 p-2 rounded"
  />

  {previewUrl && (
    <img
      src={previewUrl}
      alt="Preview"
      className="w-full mb-4 rounded border"
    />
  )}

  <button
    onClick={handleUpload}
    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
  >
    Upload
  </button>

  {uploadedUrl && (
    <div className="mt-6">
      <p className="text-green-600 font-medium mb-2">✅ Uploaded Successfully</p>
      <img
        src={uploadedUrl}
        alt="Uploaded"
        className="w-full rounded border"
      />
    </div>
  )}
</div>

  );
};

export default ImageUpload;
