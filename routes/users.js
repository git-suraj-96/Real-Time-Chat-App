const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },  
  status: { type: String, default: "offline" },  
  socketId: {type : String, default: ""},  
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
