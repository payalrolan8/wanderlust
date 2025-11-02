const express=require("express");
const router=express.Router({mergeParams:true});
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
// const {listingSchema}=require("../schema.js");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");

const {validateReview,isLoggedIn,isReviewAuthor}=require("../middleware.js");

//Post Review
router.post("/",validateReview,isLoggedIn,wrapAsync(async(req,res)=>{
     let {id}=req.params;
    let listing =await Listing.findById(id);
    console.log(req.params);
    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);
   await  newReview.save();
   await listing.save();
   console.log("new review saved");
    req.flash("success","new Review Created");

   res.redirect(`/listings/${listing._id}`);
}));
//delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(async(req,res)=>{
    let {id,reviewId}=req.params;
    await  Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted");

    res.redirect(`/listings/${id}`);
}));
module.exports=router;