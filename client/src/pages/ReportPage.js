import React from 'react';
import ComplaintForm from '../components/complaint/ComplaintForm';

const ReportPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <ComplaintForm />
      </div>
    </div>
  );
};

export default ReportPage;