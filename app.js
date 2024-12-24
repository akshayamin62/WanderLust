const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {lisingSchema, reviewSchema} = require("./schema.js");
const { error } = require("console");
const listings = require("./routes/listing.js");
// const { title } = require("process");    

app.use(express.urlencoded({extended:true})); 
app.use(methodOverride("_method"));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

app.use(express.static(path.join(__dirname,"public")));
app.engine("ejs", ejsMate);

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

main()
    .then(()=>{
        console.log("Connected to DB");
    })
    .catch((err) =>{
        console.log(err);
    })

app.listen(port,()=>{
    console.log("Server Started");
})

app.get("/",(req,res)=>{
    res.send("In root");
})

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

app.use("/listings", listings);

const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body)
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

// Listing Routes 


//Create Reviews
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    // res.send("Review Saved");
    res.redirect(`/listings/${listing._id}`)
}));

//Delete Review
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res)=> {
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`)
}));

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});

// Error handler
app.use((err,req,res,next)=>{
    let {status=500,message="something went wrong"} = err;
    res.status(status).render("error.ejs",{message});
    // res.status(status).send(message);
    // res.send("Something went wrong"); //try-catch
})