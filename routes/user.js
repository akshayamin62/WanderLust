const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const User = require("../models/user.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js")

// Sign Up 
router.get("/signup", async (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        // console.log(registeredUser);
        req.login(registeredUser, (err)=> {
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to Wonderlust!");
            res.redirect("/listings");
        })
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

// Sign In 
router.get("/login", async (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", 
    saveRedirectUrl,
    passport.authenticate("local", { 
    failureRedirect: "/login", 
    failureFlash: true, 
}), 
async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    // res.redirect("/listings");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);

})

// Sign Out 
router.get("/logout", (req, res, next) => {
    req.logout( (err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "Logout Successfully");
        res.redirect("/listings");
    });
});

module.exports = router;