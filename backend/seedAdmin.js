require("dotenv").config();

const connectDB = require("./config/database");
const User = require("./models/User");

async function seedAdmin() {
  try {
    await connectDB();

    const exists = await User.findOne({ email: "admin@calipsoadmin2.com" });

    if (exists) {
      console.log("✅ Admin already exists");
      process.exit();
    }

    await User.create({
      name: "CALIPSO Admin",
      email: "admin@calipsoadmin2.com", // also fixed mismatch (was .com in the check, .com3 in create)
      password: "admin123", // plain text — pre('save') hook hashes it once
      role: "admin"
    });

    console.log("✅ Admin created successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedAdmin();