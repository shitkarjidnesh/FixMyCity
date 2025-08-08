// import React, { useState } from "react";
// import Navbar from "./components/navbar";
import ImageUpload from "./components/ImageUpload";

function App() {
  // const [formData, setFormData] = useState({
  //   name: "",
  //   email: "",
  //   message: "",
  // });  




  



  // const [status, setStatus] = useState(null);

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const res = await fetch("http://localhost:5000/api/users", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     });
  //     const data = await res.json();
  //     if (data.success) {
        
  //       setFormData({ name: "", email: "", message: "" });
  //     } else {
  //       setStatus(`Error: ${data.error}`);
  //     }
  //   } catch (err) {
  //     setStatus(`Error: ${err.message}`);
  //   }
  // };

  return (
    <>
    {/* <Navbar/>
    <div className="pt-8">
    <div className="pt-8 max-w-md mx-auto mt-9 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">User Input Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
      {status && (
        <p className="mt-4 text-center font-medium text-sm text-gray-700">
          {status}
        </p>
      )}
    </div>
    </div></> */}
    <ImageUpload/>
    </>
  );
}

export default App;
