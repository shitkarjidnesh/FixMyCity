import React from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ComplaintLocation = ({ nextStep, prevStep, handleChange, values }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Location Details</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
          <Input
            id="address"
            onChange={handleChange('address')}
            defaultValue={values.address}
            placeholder="Enter the full address"
          />
        </div>
        <div className="flex justify-between">
          <Button onClick={prevStep} variant="secondary">Back</Button>
          <Button onClick={nextStep} variant="primary">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintLocation;
