const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/user.js");

// Sign Up 
router.get("/signup", userController.renderSignupForm);

router.post("/signup", wrapAsync(userController.signup));

// Sign In 
router.get("/login", userController.renderSigninForm);

router.post("/login", 
    saveRedirectUrl,
    passport.authenticate("local", { 
    failureRedirect: "/login", 
    failureFlash: true, 
}), 
userController.signin)

// Log Out 
router.get("/logout", userController.logout);

module.exports = router;