const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const session = require("express-session");
// http://localhost:3000/listings

const sessionOptions = {
    secret : "mysupersecretcode",
    resave : false,
    saveUninitialized : true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, //cross scripting attack
    }
}

app.use(session(sessionOptions));

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

// Listing Routes 
app.use("/listings", listings);
// Review Routes
app.use("/listings/:id/reviews", reviews);

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