const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema}=require("../schema.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");


//new route
router.get("/new",isLoggedIn,(req,res)=>{
    console.log(req.user);
    res.render("./listings/new.ejs");
})
//index route
router.get("/",wrapAsync(async(req,res)=>{
    let allListings=await Listing.find();
    console.log(allListings);
    res.render("./listings/index.ejs",{allListings});
}));
//show route
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params; 
    let listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    console.log(listing);
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("./listings/show.ejs",{listing});

}))
//add listing route
router.post("/",isLoggedIn,validateListing,wrapAsync(async(req,res)=>{
    // validateListing;
    let listing=req.body.listing;   
     const newListing=new Listing(listing);
    newListing.owner=req.user._id;
   await newListing.save();
    req.flash("success","new Listing Created");
    // listing.
    res.redirect("/listings");
}));
//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("./listings/edit.ejs",{listing});
}));

//update route
router.put("/:id",isLoggedIn,isOwner,validateListing,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const newListing=req.body.listing; 
    await Listing.findByIdAndUpdate(id,{...newListing});
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
}))
//delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");

    res.redirect("/listings");
}))
module.exports=router;