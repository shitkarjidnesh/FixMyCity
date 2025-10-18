const axios = require("axios");

async function registerUser() {
  try {
    const res = await axios.post("http://localhost:5000/api/admin/register", {
      name: "test",
      email: "test@example.com",
      password: "password123",
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

registerUser();
