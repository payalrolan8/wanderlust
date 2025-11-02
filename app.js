const express=require("express");
const app=express();
const Listing=require("./models/listing.js");
const mongoose=require("mongoose");
const ExpressError=require("./utils/ExpressError.js");
const methodOverride=require("method-override");
const path=require("path");
// const { resolveSoa } = require("dns");
const ejsMate=require("ejs-mate");
const expressSession=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy =require("passport-local");
const User=require("./models/user.js");
const sessionOptions={
    secret:"mysupersecretcode",
    resave:false,     
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};

app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(expressSession(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});
async function main() {
    await mongoose.connect(MONGO_URL);
}
app.use((req,res,next)=>{
    res.locals.success=req.flash("success"); 
    res.locals.error=req.flash("error"); 
    res.locals.currUser=req.user; 
    next();
})

app.get("/demouser",async(req,res)=>{
    let fakeUser=new User({
        email:"student@gmail.com",
        username:"delta-student"
    });
   let registeredUser=await User.register(fakeUser,"password1");
   res.send(registeredUser);
})




app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);
app.use((req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
})
app.use((err,req,res,next)=>{
     let {statusCode=500,message="Something went wrong"}=err;
    //  res.status(statusCode).send(message);
    res.status(statusCode).render("./listings/error.ejs",{message});
    // res.send("somthing went wrong");
})

app.listen(8080,()=>{
    console.log("server is listening to port 8080 ");
});