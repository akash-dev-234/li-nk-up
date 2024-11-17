const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const { userAuth } = require("./middlewares/auth");
const app = express();

app.use(express.json()); //middleware for parsing data from request body will run at every route
app.use(cookieParser()); //middleware for parsing cookies so that we get it in the request.cookies

app.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);
    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      password: passwordHash,
      emailId,
    });
    await user.save();
    res.send("User Added successfully");
  } catch (err) {
    res.status(400).send("Error saving the user: " + err.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("No user found");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const token = await jwt.sign({ _id: user._id }, "link-up@234", {
        expiresIn: "1d",
      });
      res.cookie("token", token); //sending token in cookie
      console.log(token);
      res.send("Login Successful!!!");
    } else {
      throw new Error("Invalid Credentials!!");
    }
  } catch (err) {
    console.log(err);
    res.status(400).send("Error:" + err.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    console.log(err, "err");
    res.status(400).send("Cannot get profile" + err.message);
  }
});

// Feed Api
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});

app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    res.send("User deleted successfully");
  } catch (err) {
    // console.log(first)
    res.status(400).send("Something went wrong");
  }
});

app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try {
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];
    const isUpdateAllowed = Object.keys(data).every((item) =>
      ALLOWED_UPDATES.includes(item)
    );
    if (!isUpdateAllowed) {
      throw new Error("Updated not allowed");
    }
    if (data.skills.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }
    await User.findByIdAndUpdate({ _id: userId }, data, {
      runValidators: true, //adding run validators because validator function in the schema do not run for patch by default
    });
    res.send("User updated successfully");
  } catch (err) {
    console.log(err, "err");
    res.status(400).send("Something went wrong");
  }
});

connectDB()
  .then(() => {
    console.log("Database connected");
    app.listen(3000, () => {
      console.log("Server is successfully listening on port 3000");
    });
  })
  .catch((err) => {
    console.log("Database cannot be connected");
  });
