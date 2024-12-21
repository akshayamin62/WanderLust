const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Listing = require("./models/listing.js");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {lisingSchema} = require("./schema.js");
const { error } = require("console");
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

// app.get("/testListing",async (req,res)=>{
//     let sampleListing = new Listing({
//         title : "My new Villa",
//         description : "In the Mountains",
//         price : 2000,
//         loaction : "Calanguate , Goa",
//         country : "India",
//     });

//     // await sampleListing.save();
//     console.log("Sample Save");
//     res.send("Successful Testing");
// });


// Index Route 
app.get("/listings", wrapAsync(async (req,res)=>{
    let allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

// Create Route 
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

//Try Catch
// app.post("/listings", async (req,res,next)=>{
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
// app.post("/listings", wrapAsync( async (req,res,next)=>{
//         let listing = req.body.listing;
//         let newListing = new Listing(listing);
//         await newListing.save();
//         res.redirect("/listings");
// }));

//Express Error
// app.post("/listings", wrapAsync( async (req,res,next)=>{
//         let listing = req.body.listing;
//         if(!listing){
//             throw new ExpressError(400,"Send valid data for listing");
//         }
//         let newListing = new Listing(listing);
//         await newListing.save();
//         res.redirect("/listings");
// }));


// app.post("/listings", wrapAsync( async (req,res,next)=>{
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
// app.post("/listings",wrapAsync(async(req,res,next)=>{
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

app.post("/listings", validateListing,wrapAsync(async(req,res,next)=>{
    let listing = req.body.listing;
    let newListing = new Listing(listing);
    await newListing.save();
    res.redirect("/listings");
}));


// Show Route 
app.get("/listings/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}));

// Edit Route 
app.get("/listings/:id/edit", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

// Update Route 
app.put("/listings/:id/", validateListing, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    // let listing = await Listing.findById(id);
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send valid data for listing");
    // }
    await Listing.findByIdAndUpdate(id , {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

// Delete Route 
app.delete("/listings/:id/", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    // let listing = await Listing.findById(id);
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
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