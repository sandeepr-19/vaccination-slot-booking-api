const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Booking = require("../models/booking.model");
const Centers = require("../models/center.model");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    /**  hashes the password with dynamic salt */

    const hashedPassword = await bcrypt.hash(password, 10);

    /** new user is saved to db */
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

    /** finds the user thats maches the email */

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Not a user" });
    }

    /** compares the user given password and the hashed password that is saved the db */

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    /** creates a new jwt token */
    const accessToken = jwt.sign(
      { name: user.name, id: user.id },
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
    /**contains all the centers */

    const centers = await Centers.find().exec();

    /** stores the center that matches the location provided by user */
    var centersInLocation = [];

    centers.forEach((center) => {
      if (center.address == location) {
        centersInLocation.push(center.id.toString());
      }
    });

    /** maps center to no.of slots available*/

    const availableSlotMap = new Map();

    centersInLocation.forEach((element) => {
      availableSlotMap.set(element, 10);
    });

    /** stores the bookings that matches the provided date */
    const bookings = await Booking.find({ date: date }).exec();

    /** stores the center id that of the above booking */
    const centerIds = bookings.map((booking) => booking.centerId.toString());

    centerIds.forEach((centerId) => {
      if (availableSlotMap.has(centerId)) {
        /** temparory identifer to store the center id */
        let availableSlots = availableSlotMap.get(centerId);

        availableSlotMap.set(centerId, availableSlots - 1);
      }
    });

    /** converts the availableSlotMap to object */
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

    /** stores all the booking that match both date and centerId */
    const bookings = await Booking.find({ date, centerId }).exec();

    /** stores the all the slots that been booked for the given a date in a certain center */
    const bookingArray = bookings.map((booking) => booking.slot);

    res.json(bookingArray);
  } catch (err) {
    console.error(err);

    res.status(500).json({ message: "Internal server error" });
  }
};
