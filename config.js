const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Multer storage config
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "wonderlust_DEV", // Cloudinary folder name
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  },
});


module.exports = { cloudinary, storage };