const jwt = require("jsonwebtoken");
const User = require("../models/user");
const userAuth = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    const { token } = cookies;
    if (!token) {
      throw new Error("Token is not valid");
    }
    const decodedObj = await jwt.verify(token, "link-up@234");
    const { _id } = decodedObj;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user; //attaching the user obj to req so that it can be accessible in the route handler
    next(); //next is called for moving the control to request handler
  } catch (err) {
    res.status(400).send("Error", +err.message);
  }
};

module.exports = { userAuth };
