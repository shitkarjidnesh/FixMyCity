import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function AddAdmin() {
  const [form, setForm] = useState({
    name: "",
    middleName: "",
    surname: "",
    email: "",
    phone: "",
    password: "",
    dob: "",
    gender: "",
    idProofType: "",
    idProofNumber: "",
    governmentEmployeeId: "",
    blockOrRegion: "",
    address: {
      houseNo: "",
      street: "",
      landmark: "",
      area: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
    },
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [idProofImage, setIdProofImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setForm({
      ...form,
      address: { ...form.address, [e.target.name]: e.target.value },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const today = new Date();
    const birthDate = new Date(form.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      toast.error("⚠️ Admin must be at least 18 years old.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();

      for (const key in form) {
        if (key === "address") {
          for (const addrKey in form.address) {
            formData.append(`address[${addrKey}]`, form.address[addrKey]);
          }
        } else {
          formData.append(key, form[key]);
        }
      }

      if (profilePhoto) formData.append("profilePhoto", profilePhoto);
      if (idProofImage) formData.append("idProofImage", idProofImage);

      const res = await axios.post(
        "http://localhost:5000/api/admin/register",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(res.data?.msg || "✅ Admin registered successfully!");
      setForm({
        name: "",
        middleName: "",
        surname: "",
        email: "",
        phone: "",
        password: "",
        dob: "",
        gender: "",
        idProofType: "",
        idProofNumber: "",
        governmentEmployeeId: "",
        blockOrRegion: "",
        address: {
          houseNo: "",
          street: "",
          landmark: "",
          area: "",
          city: "",
          district: "",
          state: "",
          pincode: "",
        },
      });
      setProfilePhoto(null);
      setIdProofImage(null);
    } catch (err) {
      toast.error(
        err.response?.data?.error || "❌ Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Admin Registration
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name Fields */}
          <div>
            <label className="block text-gray-700 mb-1">First Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter first name"
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Middle Name</label>
            <input
              name="middleName"
              value={form.middleName}
              onChange={handleChange}
              placeholder="Enter middle name"
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Surname</label>
            <input
              name="surname"
              value={form.surname}
              onChange={handleChange}
              placeholder="Enter surname"
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Phone Number</label>
            <input
              name="phone"
              type="tel"
              pattern="[0-9]{10}"
              value={form.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create password"
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Date of Birth</label>
            <input
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          {/* ID Proof */}
          <div>
            <label className="block text-gray-700 mb-1">ID Proof Type</label>
            <select
              name="idProofType"
              value={form.idProofType}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
              <option value="">Select ID type</option>
              <option value="Aadhaar Card">Aadhaar Card</option>
              <option value="PAN Card">PAN Card</option>
              <option value="Voter ID">Voter ID</option>
              <option value="Passport">Passport</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">ID Proof Number</label>
            <input
              name="idProofNumber"
              value={form.idProofNumber}
              onChange={handleChange}
              placeholder="Enter ID number"
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Employee ID</label>
            <input
              name="governmentEmployeeId"
              value={form.governmentEmployeeId}
              onChange={handleChange}
              placeholder="Enter government employee ID"
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Block / Region</label>
            <input
              name="blockOrRegion"
              value={form.blockOrRegion}
              onChange={handleChange}
              placeholder="Enter assigned region"
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* File Uploads */}
          <div>
            <label className="block text-gray-700 mb-1">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePhoto(e.target.files[0])}
              required
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">ID Proof Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setIdProofImage(e.target.files[0])}
              required
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2 border-t pt-4">
            <h2 className="font-semibold text-lg mb-2 text-gray-800">
              Address Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "houseNo",
                "street",
                "landmark",
                "area",
                "city",
                "district",
                "state",
                "pincode",
              ].map((field) => (
                <input
                  key={field}
                  name={field}
                  placeholder={field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (s) => s.toUpperCase())}
                  value={form.address[field]}
                  onChange={handleAddressChange}
                  required={["area", "city", "state", "pincode"].includes(
                    field
                  )}
                  className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-2 rounded-md transition duration-200 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}>
              {loading ? "Registering..." : "Register Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
