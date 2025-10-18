import React from 'react';
import Button from '../ui/Button';

const ComplaintReview = ({ prevStep, handleSubmit, values, loading, error }) => {
  const { type, description, address, image } = values;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Review Your Complaint</h2>
      <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
        <div>
          <h3 className="font-semibold">Type:</h3>
          <p>{type}</p>
        </div>
        <div>
          <h3 className="font-semibold">Description:</h3>
          <p>{description}</p>
        </div>
        <div>
          <h3 className="font-semibold">Address:</h3>
          <p>{address}</p>
        </div>
        {image && (
          <div>
            <h3 className="font-semibold">Image:</h3>
            <img src={URL.createObjectURL(image)} alt="Complaint" className="w-full h-auto rounded-md mt-2" />
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      <div className="flex justify-between mt-6">
        <Button onClick={prevStep} variant="secondary" disabled={loading}>Back</Button>
        <Button onClick={handleSubmit} variant="primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </Button>
      </div>
    </div>
  );
};

export default ComplaintReview;
