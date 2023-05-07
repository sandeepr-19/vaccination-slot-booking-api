const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Booking = require("../models/booking.model");
const Centers = require("../models/center.model");
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

router.post("/myBookings", async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await Booking.find({ userId: userId }).exec();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/filter", async (req, res) => {
  const { date, location } = req.body;
  let availableSlotMap = new Map();
  try {
    const centers = await Centers.find().exec();
    const centersId = centers.map(function (center) {
      return center.id;
    });
    centersId.forEach((element) => {
      availableSlotMap.set(element, 10);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }

  try {
    const result = await Booking.find({ date: date }).exec();
    const centerIds = result.map((centerId) => {
      return centerId.centerId.toString();
    });
    await centerIds.forEach((centerId) => {
      if (availableSlotMap.has(centerId)) {
        let availableSlots = availableSlotMap.get(centerId);
        console.log(availableSlots, centerId);
        availableSlotMap.set(centerId, availableSlots - 1);
      }
    });
    let mapObject = Object.fromEntries(availableSlotMap);
    res.json(mapObject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/centers", async (req, res) => {
  try {
    const centers = await Centers.find({});
    return res.status(201).json(centers);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

router.post("/centers/slots", async (req, res) => {
  try {
    const { date, centerId } = req.body;
    Booking.find(
      {
        date: date,
        centerId: centerId,
      },
      function (err, bookings) {
        if (err) throw err;
        const bookingArray = bookings.map(function (booking) {
          return booking.slot;
        });
        res.json(bookingArray);
      }
    );
  } catch (err) {
    return res.status(500).json({ error: "server eror" });
  }
});

module.exports = router;
