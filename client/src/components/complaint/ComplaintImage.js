import React, { useState } from 'react';
import Button from '../ui/Button';

const ComplaintImage = ({ nextStep, prevStep, handleChange, values }) => {
  const [preview, setPreview] = useState(values.image ? URL.createObjectURL(values.image) : null);

  const handleImageChange = (e) => {
    handleChange('image')(e);
    if (e.target.files[0]) {
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Upload an Image</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {preview && (
          <div className="mt-4">
            <img src={preview} alt="Preview" className="w-full h-auto rounded-md" />
          </div>
        )}
        <div className="flex justify-between">
          <Button onClick={prevStep} variant="secondary">Back</Button>
          <Button onClick={nextStep} variant="primary">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintImage;
