const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const jwtAuth = require("../midddlewares/auth");

router.post("/signin", adminController.signInAdmin);

router.post("/addCenter", jwtAuth.authenticateToken, adminController.addCenter);

router.delete(
  "/deleteCenter/:id",
  jwtAuth.authenticateToken,
  adminController.removeCenter
);

router.post(
  "/getDosageDetails",
  jwtAuth.authenticateToken,
  adminController.getDosageDetails
);

module.exports = router;
