import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

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
    role: "admin",
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
  const [showPassword, setShowPassword] = useState(false);
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const token = localStorage.getItem("admintoken");

        const res = await axios.get(
          "http://localhost:5000/api/admin/block/dropdown",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setBlocks(res.data.data || []);
      } catch (err) {
        console.error("❌ Failed to load blocks:", err);
        toast.error("⚠️ Could not load blocks.");
      }
    };

    fetchBlocks();
  }, []);

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

    // Age validation
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
        role: "admin",
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
          autoComplete="off"
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
              autoComplete="off"
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
              autoComplete="off"
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
              autoComplete="off"
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
              autoComplete="off"
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
              autoComplete="off"
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password with Eye Toggle */}
          <div className="relative">
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Create password"
              required
              autoComplete="new-password"
              className="w-full border rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-gray-700 mb-1">Date of Birth</label>
            <input
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          {/* ID Proof Type */}
          <div>
            <label className="block text-gray-700 mb-1">ID Proof Type</label>
            <select
              name="idProofType"
              value={form.idProofType}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
              <option value="">Select ID Proof Type</option>
              <option value="Aadhaar Card">Aadhaar Card</option>
              <option value="PAN Card">PAN Card</option>
              <option value="Voter ID">Voter ID</option>
              <option value="Passport">Passport</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* ID Proof Number */}
          <div>
            <label className="block text-gray-700 mb-1">ID Proof Number</label>
            <input
              name="idProofNumber"
              value={form.idProofNumber}
              onChange={handleChange}
              placeholder="Enter ID proof number"
              required
              autoComplete="off"
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Employee ID */}
          <div>
            <label className="block text-gray-700 mb-1">Employee ID</label>
            <input
              name="governmentEmployeeId"
              value={form.governmentEmployeeId}
              onChange={handleChange}
              placeholder="Enter government employee ID"
              required
              autoComplete="off"
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Block / Region */}
          <div>
            <label className="block text-gray-700 mb-1">Block / Region</label>
            <select
              name="blockOrRegion"
              value={form.blockOrRegion}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
              <option value="">Select Block / Region</option>
              {blocks.map((block) => (
                <option key={block._id} value={block._id}>
                  {block.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role (Admin/SuperAdmin) */}
          <div>
            <label className="block text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
              <option value="admin">Admin</option>
              <option value="superadmin">SuperAdmin</option>
            </select>
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

          {/* Address Section */}
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
                  autoComplete="off"
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
