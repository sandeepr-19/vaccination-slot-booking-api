const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Booking = require("../models/booking.model");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ message: "User signin successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/book", async (req, res) => {
  try {
    const { date, slot, centerId, userId } = req.body;

    const booking = new Booking({
      date,
      slot,
      centerId,
      userId,
    });
    await booking.save();

    res.status(201).json({ message: "booking registered" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/filter", async (req, res) => {
  const { date, location } = req.body;

  Booking.find({ date: date }, (err, bookings) => {
    if (err) {
      return res.status(500).json({ error: "server error" });
    }
    return res.json(bookings);
  });
});

module.exports = router;
