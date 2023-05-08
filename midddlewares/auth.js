const jwt = require("jsonwebtoken");

/** authenticates the user */

exports.authenticateToken = (req, res, next) => {
  /** contains the details of authorization header */

  const authHeader = req.headers["authorization"];

  /** contins the token details */

  const token = authHeader && authHeader.split(" ")[1];

  if (token === null)
    return res.status(401).json({ message: "Not Authorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: err });

    req.email = user.id;

    next();
  });
};
