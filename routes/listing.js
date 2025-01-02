const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {lisingSchema, reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");


// Index Route 
router.get("/", wrapAsync(listingController.index));

// New 
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Try Catch
// router.post("/listings", async (req,res,next)=>{
//     try{
//         let listing = req.body.listing;
//         let newListing = new Listing(listing);
//         await newListing.save();
//         res.redirect("/listings");
//     }catch(err){
//         next(err);
//     }
// })


//WrapAsync
// router.post("/listings", wrapAsync( async (req,res,next)=>{
//         let listing = req.body.listing;
//         let newListing = new Listing(listing);
//         await newListing.save();
//         res.redirect("/listings");
// }));

//Express Error
// router.post("/listings", wrapAsync( async (req,res,next)=>{
//         let listing = req.body.listing;
//         if(!listing){
//             throw new ExpressError(400,"Send valid data for listing");
//         }
//         let newListing = new Listing(listing);
//         await newListing.save();
//         res.redirect("/listings");
// }));


// router.post("/listings", wrapAsync( async (req,res,next)=>{
//         let listing = req.body.listing;
//         if(!listing){
//             throw new ExpressError(400,"Send valid data for listing");
//         }
//         let newListing = new Listing(listing);
//         if(!newListing.title){
//             throw new ExpressError(400,"Title is missing");
//         }
//         if(!newListing.description){
//             throw new ExpressError(400,"description is missing");
//         }
//         if(!newListing.location){
//             throw new ExpressError(400,"location is missing");
//         }
//         await newListing.save();
//         res.redirect("/listings");
// }));


// Joi 
// router.post("/listings",wrapAsync(async(req,res,next)=>{
//     let result = lisingSchema.validate(req.body)
//     // console.log(result)
//     if(result.error){
//         throw new ExpressError(400,result.error);
//     }
//     let listing = req.body.listing;
//     let newListing = new Listing(listing);
//     await newListing.save();
//     res.redirect("/listings");
// }));

// Create Route
router.post("/", isLoggedIn, validateListing,wrapAsync(listingController.createListing));

// Show Route 
router.get("/:id", wrapAsync(listingController.showListing));

// Edit Route 
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Update Route 
router.put("/:id/", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// Delete Route 
router.delete("/:id/", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;