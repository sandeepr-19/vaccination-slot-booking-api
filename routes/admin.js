const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Center = require("../models/center.model");
const router = express.Router();

router.post("/signin", async (req, res) => {
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

    res.json({ message: "Admin signin successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/addCenter", async (req, res) => {
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
});
module.exports = router;
