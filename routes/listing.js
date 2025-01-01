const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {lisingSchema, reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js");


// Index Route 
router.get("/", wrapAsync(async (req,res)=>{
    let allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

// Create Route 
router.get("/new", isLoggedIn, (req,res)=>{
    // console.log(req.user);
    res.render("listings/new.ejs");
})

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

router.post("/", isLoggedIn, validateListing,wrapAsync(async(req,res,next)=>{
    let listing = req.body.listing;
    let newListing = new Listing(listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}));


// Show Route 
router.get("/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate("reviews").populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}));

// Edit Route 
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
}));

// Update Route 
router.put("/:id/", isLoggedIn, isOwner, validateListing, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    // let listing = await Listing.findById(id);
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send valid data for listing");
    // }
    await Listing.findByIdAndUpdate(id , {...req.body.listing});
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

// Delete Route 
router.delete("/:id/", isLoggedIn, isOwner, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    // let listing = await Listing.findById(id);
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;