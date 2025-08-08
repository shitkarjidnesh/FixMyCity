import React, { useRef, useState } from "react";
import axios from "axios";

const ImageUpload = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [uploadedUrl, setUploadedUrl] = useState("");

  // Start webcam & get GPS location
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => console.error("GPS error:", err),
        { enableHighAccuracy: true }
      );
    } catch (err) {
      console.error("Camera start error:", err);
    }
  };

  // Capture photo from video
  const capturePhoto = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, 400, 300);
    const dataUrl = canvasRef.current.toDataURL("image/jpeg");
    setPreviewUrl(dataUrl);
    setPhotoTaken(true);
  };

  // Upload to backend → Cloudinary + MongoDB
  const uploadPhoto = async () => {
    try {
      const blob = await (await fetch(previewUrl)).blob();
      const formData = new FormData();
      formData.append("image", blob, "photo.jpg");
      formData.append("latitude", coords.lat);
      formData.append("longitude", coords.lng);

      const res = await axios.post("http://localhost:5000/api/upload", formData);
      console.log("✅ Uploaded to Cloudinary:", res.data.imageUrl);
      console.log(`✅ MongoDB record created with GPS: ${coords.lat}, ${coords.lng}`);

      setUploadedUrl(res.data.imageUrl);
      alert("Photo uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-5 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Capture Live Photo with GPS
      </h2>

      {!photoTaken && (
        <>
          <video ref={videoRef} autoPlay width="400" height="300"></video>
          <div className="mt-2 flex gap-2">
            <button
              onClick={startCamera}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Start Camera
            </button>
            <button
              onClick={capturePhoto}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Capture Photo
            </button>
          </div>
        </>
      )}

      <canvas ref={canvasRef} width="400" height="300" style={{ display: "none" }}></canvas>

      {previewUrl && (
        <div className="mt-4">
          <img src={previewUrl} alt="Captured" className="w-full rounded border" />
          <p>Latitude: {coords.lat}</p>
          <p>Longitude: {coords.lng}</p>
          <button
            onClick={uploadPhoto}
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 mt-2"
          >
            Upload to Cloudinary
          </button>
        </div>
      )}

      {uploadedUrl && (
        <div className="mt-6">
          <p className="text-green-600 font-medium mb-2">✅ Uploaded Successfully</p>
          <img src={uploadedUrl} alt="Uploaded" className="w-full rounded border" />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
