import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import ComplaintDetails from "./ComplaintDetails";
import ComplaintLocation from "./ComplaintLocation";
import ComplaintImage from "./ComplaintImage";
import ComplaintReview from "./ComplaintReview";

const ComplaintForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    address: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleChange = (input) => (e) => {
    if (input === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [input]: e.target.value });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const postData = new FormData();
    postData.append("type", formData.type);
    postData.append("description", formData.description);
    postData.append("address", formData.address);
    postData.append("image", formData.image);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/complaints", postData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });
      navigate("/my-complaints");
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ComplaintDetails
            nextStep={nextStep}
            handleChange={handleChange}
            values={formData}
          />
        );
      case 2:
        return (
          <ComplaintLocation
            nextStep={nextStep}
            prevStep={prevStep}
            handleChange={handleChange}
            values={formData}
          />
        );
      case 3:
        return (
          <ComplaintImage
            nextStep={nextStep}
            prevStep={prevStep}
            handleChange={handleChange}
            values={formData}
          />
        );
      case 4:
        return (
          <ComplaintReview
            prevStep={prevStep}
            handleSubmit={handleSubmit}
            values={formData}
            loading={loading}
            error={error}
          />
        );
      default:
        return <div>Error: Unknown Step</div>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        {/* Step Indicator */}
      </div>
      {renderStep()}
    </div>
  );
};

export default ComplaintForm;
