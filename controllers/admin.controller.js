const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Center = require("../models/center.model");

exports.signInAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (!user.isAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      { email, id: user.id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.NODE_ENV === "production" ? "6h" : "2 days",
      }
    );

    res.json({ message: "Admin signin successful", accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.addCenter = async (req, res) => {
  try {
    const { name, address } = req.body;

    const center = new Center({
      name,
      address,
    });
    await center.save();

    res.status(201).json({ message: "center added" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "server error" });
  }
};

exports.removeCenter = async (req, res) => {
  const { id } = req.params;

  try {
    const center = await Center.findByIdAndDelete({ _id: id });
    if (!center) {
      return res.status(404).json({ message: "center not found" });
    }
    res.json({ message: "center deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
