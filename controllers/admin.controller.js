const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Center = require("../models/center.model");
const Booking = require("../models/booking.model");
const jwt = require("jsonwebtoken");

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

    /** compares hased passwod from the db and password from the user */

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    /**
     * jwt token contains the access token and the name of the user
     */

    const accessToken = jwt.sign(
      { name: user.name, id: user.id },
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

    /** used to save the center info to the database */

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

exports.getDosageDetails = async (req, res) => {
  const { date } = req.body;

  try {
    /** contains all the center details */

    const centers = await Center.find().exec();

    /** a map that stores center id as key and maps it to a object{center name,booked slots in the center} */

    const availableSlotMap = new Map();

    centers.forEach((element) => {
      availableSlotMap.set(element.id.toString(), {
        name: element.name,
        bookedSlots: 0,
      });
    });

    /** stores the all the bookings */
    const bookings = await Booking.find({ date: date }).exec();

    //booked slots is counted

    bookings.map((booking) => {
      if (availableSlotMap.has(booking.centerId.toString())) {
        /** tempory object to store the maped object */

        const obj = availableSlotMap.get(booking.centerId.toString());
        obj.bookedSlots++; // Increment the slot booked by 1
        availableSlotMap.set(booking.centerId.toString(), obj);
      }
    });
    const availableSlotObj = Object.fromEntries(availableSlotMap);
    res.json(availableSlotObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
