const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

//middlewares
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//database url
const MONGO_URL = "mongodb://127.0.0.1/staymingle";

main().then(() =>{
    console.log("Connected to DB");
})
.catch((err) =>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) =>{
    res.send("Hi, I am root");
});

app.get("/listings", wrapAsync(async (req, res) =>{
    const allListings = await Listing.find();
    res.render("listings/index.ejs", {allListings});
}));

app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//update route
app.put("listings/:id",wrapAsync(async (req, res) =>{
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data!");
    }
    let {id} = req.params;
    Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//delete route
app.delete("/listings/:id",wrapAsync(async (req, res) =>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

//edit route
app.get("/listings/:id/edit",wrapAsync( async (req, res) =>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing})
}));


app.get("/listings/:id",wrapAsync(async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));

//Create route
app.post("/listings",wrapAsync(async(req, res, next) =>{
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data!");
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})
);

app.all("*", (req, res, next) =>{
    next(new ExpressError(404, "Page not found!"));
});

//middleware to handle errors
app.use((err, req, res, next) =>{
    let {status, message} = err;
    res.status(status).send(message);
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});
