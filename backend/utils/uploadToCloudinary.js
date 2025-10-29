const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `fixmycity/${folder}`,
      resource_type: "auto",
    });
    return { url: result.secure_url, public_id: result.public_id };
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};

module.exports = uploadToCloudinary;
