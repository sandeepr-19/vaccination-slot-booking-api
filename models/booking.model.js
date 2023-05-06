const { mongoose } = require("mongoose");
const Schema = mongoose.Schema;
const Center = require("./center.model");
const User = require("./user.model");
const bookingSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  slot: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  centerId: {
    type: Schema.Types.ObjectId,
    ref: "Center",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
