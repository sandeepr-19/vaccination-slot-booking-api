const express = require("express");
const router = express.Router();
const jwtAuth = require("../midddlewares/auth");
const userController = require("../controllers/user.controller");
const bookingController = require("../controllers/booking.controller");

router.post("/register", userController.registerUser);

router.post("/signin", userController.signInUser);

router.post("/bookSlot", jwtAuth.authenticateToken, bookingController.bookSlot);

router.post(
  "/myBookings",
  jwtAuth.authenticateToken,
  bookingController.getUserBookings
);

router.post("/filter", jwtAuth.authenticateToken, userController.filterSlots);

router.get("/centers", jwtAuth.authenticateToken, userController.getCenters);

router.post(
  "/slots",
  jwtAuth.authenticateToken,
  userController.getSlotsForCenter
);

module.exports = router;
