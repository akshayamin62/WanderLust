const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {lisingSchema, reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");


const validateListing = (req,res,next) => {
    let {error} = lisingSchema.validate(req.body)
    // console.log(error)
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

// Index Route 
router.get("/", wrapAsync(async (req,res)=>{
    let allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

// Create Route 
router.get("/new",(req,res)=>{
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

router.post("/", validateListing,wrapAsync(async(req,res,next)=>{
    let listing = req.body.listing;
    let newListing = new Listing(listing);
    await newListing.save();
    res.redirect("/listings");
}));


// Show Route 
router.get("/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));

// Edit Route 
router.get("/:id/edit", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

// Update Route 
router.put("/:id/", validateListing, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    // let listing = await Listing.findById(id);
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send valid data for listing");
    // }
    await Listing.findByIdAndUpdate(id , {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

// Delete Route 
router.delete("/:id/", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    // let listing = await Listing.findById(id);
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

module.exports = router;