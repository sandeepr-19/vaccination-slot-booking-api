const Booking = require("../models/booking.model");

exports.bookSlot = async (req, res) => {
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

exports.getUserBookings = async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await Booking.find({ userId: userId }).exec();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
