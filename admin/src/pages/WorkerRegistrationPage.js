import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function AddWorker() {
  const [form, setForm] = useState({
    name: "",
    middleName: "",
    surname: "",
    email: "",
    phone: "",
    password: "",
    dob: "",
    gender: "",
    employeeId: "",
    experience: "",
    department: "",
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
  const [idProof, setIdProof] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch Departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("admintoken");
        if (!token) throw new Error("Unauthorized access");

        const res = await axios.get(
          "http://localhost:5000/api/admin/departments",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setDepartments(res.data || []);
      } catch (err) {
        console.error("Error loading departments:", err);
        toast.error("⚠️ Could not load departments.");
      }
    };
    fetchDepartments();
  }, []);

  // ✅ Handlers
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setForm({
      ...form,
      address: { ...form.address, [e.target.name]: e.target.value },
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "profilePhoto") setProfilePhoto(files[0]);
    if (name === "idProof") setIdProof(files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Age validation
      const today = new Date();
      const birthDate = new Date(form.dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      if (age < 18) {
        toast.error("⚠️ Worker must be at least 18 years old.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("admintoken");
      if (!token) throw new Error("Unauthorized access");

      // ✅ Prepare FormData
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "address") {
          Object.entries(value).forEach(([k, v]) =>
            formData.append(`address[${k}]`, v)
          );
        } else {
          formData.append(key, value);
        }
      });

      if (profilePhoto) formData.append("profilePhoto", profilePhoto);
      if (idProof) formData.append("idProof", idProof);

      // ✅ API call
      const res = await axios.post(
        "http://localhost:5000/api/admin/addWorker",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(res.data?.message || "✅ Worker added successfully!");
      setForm({
        name: "",
        middleName: "",
        surname: "",
        email: "",
        phone: "",
        password: "",
        dob: "",
        gender: "",
        employeeId: "",
        experience: "",
        department: "",
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
      setIdProof(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "❌ Failed to add worker. Try again."
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
          Worker Registration
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Info */}
          {[
            { name: "name", label: "First Name", req: true },
            { name: "middleName", label: "Middle Name" },
            { name: "surname", label: "Surname", req: true },
            { name: "email", label: "Email", type: "email", req: true },
            {
              name: "phone",
              label: "Phone Number",
              type: "tel",
              pattern: "[0-9]{10}",
              req: true,
            },
            {
              name: "password",
              label: "Password",
              type: "password",
              req: true,
            },
            { name: "dob", label: "Date of Birth", type: "date", req: true },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-gray-700 mb-1">{f.label}</label>
              <input
                name={f.name}
                type={f.type || "text"}
                pattern={f.pattern}
                value={form[f.name]}
                onChange={handleChange}
                placeholder={`Enter ${f.label.toLowerCase()}`}
                required={f.req}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

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

          {/* Work Info */}
          <div>
            <label className="block text-gray-700 mb-1">Employee ID</label>
            <input
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              placeholder="Enter employee ID"
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Department</label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">
              Experience (Years)
            </label>
            <input
              name="experience"
              type="number"
              min="0"
              value={form.experience}
              onChange={handleChange}
              placeholder="e.g., 3"
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
              name="profilePhoto"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">ID Proof</label>
            <input
              type="file"
              name="idProof"
              accept="image/*"
              onChange={handleFileChange}
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
              {loading ? "Registering Worker..." : "Register Worker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
