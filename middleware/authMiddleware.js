const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1]; // bearer token
    if (!token) {
      return res.status(401).json("User is not registered ");
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;

    next();
  } catch (e) {
    return res.status(401).json("User is not registered ");
  }
};
