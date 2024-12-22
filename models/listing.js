const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const lisingSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
    },
    description : String,
    image : {
        type : String,
        default : "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        set : (v) => v === "" ? "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60" : v, 
    },
    price : Number,
    location : String,
    country : String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ]
});

lisingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing.reviews.length){
        await Review.deleteMany({_id: {$in: listing.reviews}})
    }
});

const Listing = mongoose.model("Listing",lisingSchema);
module.exports = Listing;