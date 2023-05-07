const Booking = require("../models/booking.model");
const Centers = require("../models/center.model");

exports.book = async (req, res) => {
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
};

exports.myBookings = async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await Booking.find({ userId: userId }).exec();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.filter = async (req, res) => {
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
        availableSlotMap.set(centerId,
