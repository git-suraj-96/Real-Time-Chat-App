require("dotenv").config();

var express = require("express");
var router = express.Router();
const userModel = require("./users");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {io} = require('../bin/www');

/* GET home page. */
router.get("/home",isLoggedIn,async function (req, res, next) {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.JWT_SECRET);
  const email = decode.email;
  const users = await userModel.find({status : "online" , email : {$ne : email}});
  res.render("index", {users});
});



/*Get your login page */
router.get("/", function (req, res, next) {
  res.render("login", {message : null});
});

/*Get signup page. */
router.get("/signup", function (req, res, next) {
  res.render("signup", { message: null });
});

/* Register the user*/
router.post("/signup", async (req, res) => {
  try {
    const { fullname, email, password, confirmPasssword } = req.body;
    if (!(fullname && email && confirmPasssword && password)) {
      return res.render("signup", { message: "Please fill all credentials." });
    }

    if (password !== confirmPasssword) {
      return res.render("signup", { message: "Please check password" });
    }

    const userExist = await userModel.findOne({ email: email });
    if (userExist)
      return res.render("signup", { message: "Email already taken." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      fullname,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token);

    res.redirect("/home");
  } catch (err) {
    console.log(err);
  }
});

/* The `router.post("/login", async (req, res) => { ... }` function in the code snippet is handling the
login functionality for users. Here's a breakdown of what it does: */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.render("login", { message: "Please fill all credentials." });
    }

    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.render("login", { message: "User not found" });
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.render("login", { message: "Wrong password" });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    // 5. Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // https par true karna
      sameSite: "lax",
    });
    res.redirect("/home");

  } catch (err) {
    console.log(err);
    res.render('login', {message : "Server Error"});
  }
});

/* The `// Logout user` section in the code defines a route for logging out a user. When a GET request
is made to the `/logout` endpoint, the code inside the route handler function is executed. Here's
what it does: */
router.get('/logout', (req, res) => {
  try {
    // Delete the cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0)   // clear cookie
    });

    // Redirect after clearing cookie
    return res.redirect("/");
    
  } catch (err) {
    console.log(err);
  }
});

// Function that will check user is loggedIn or not
function isLoggedIn(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect("/");

    next();
  } catch (err) {
    console.log(err);
    return res.redirect("/");
  }
}

// use socket here now
router.post('/send', (req, res)=>{

})


module.exports = router;
