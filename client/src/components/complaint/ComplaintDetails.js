import React from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ComplaintDetails = ({ nextStep, handleChange, values }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Report a Complaint</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Complaint Type</label>
                    <select
            id="type"
            onChange={handleChange('type')}
            defaultValue={values.type}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select a complaint type</option>
            <option value="Pothole">Pothole</option>
            <option value="Broken Streetlight">Broken Streetlight</option>
            <option value="Garbage Collection">Garbage Collection</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            onChange={handleChange('description')}
            defaultValue={values.description}
            placeholder="Provide a detailed description of the issue"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="4"
          />
        </div>
        <Button onClick={nextStep} variant="primary">Next</Button>
      </div>
    </div>
  );
};

export default ComplaintDetails;
