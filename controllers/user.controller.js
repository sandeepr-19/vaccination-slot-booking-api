const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Booking = require("../models/booking.model");
const Centers = require("../models/center.model");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
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
};

exports.signInUser = async (req, res) => {
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

    const accessToken = jwt.sign(
      { email, id: user.id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.NODE_ENV === "production" ? "6h" : "2 days",
      }
    );

    res.json({ message: "User signin successful", accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.filterSlots = async (req, res) => {
  const { date, location } = req.body;

  try {
    const centers = await Centers.find().exec();
    var centersInLocation = [];
    centers.forEach((center) => {
      if (center.address == location) {
        centersInLocation.push(center.id.toString());
      }
    });
    const availableSlotMap = new Map();
    centersInLocation.forEach((element) => {
      availableSlotMap.set(element, 10);
    });
    const bookings = await Booking.find({ date: date }).exec();
    const centerIds = bookings.map((booking) => booking.centerId.toString());

    centerIds.forEach((centerId) => {
      if (availableSlotMap.has(centerId)) {
        let availableSlots = availableSlotMap.get(centerId);
        availableSlotMap.set(centerId, availableSlots - 1);
      }
    });

    const availableSlotObj = Object.fromEntries(availableSlotMap);
    res.json(availableSlotObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCenters = async (req, res) => {
  try {
    const centers = await Centers.find({});
    return res.status(200).json(centers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSlotsForCenter = async (req, res) => {
  try {
    const { date, centerId } = req.body;
    const bookings = await Booking.find({ date, centerId }).exec();
    const bookingArray = bookings.map((booking) => booking.slot);
    res.json(bookingArray);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
