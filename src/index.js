const express=require('express');
const path=require("path");
const bcrypt=require('bcrypt');
const { collection, SlotCollection ,HistoryCollection} = require("./config");



const app=express();


// Flash middleware

//convert data to json
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.set('view engine','ejs');

app.use(express.static('public'));

app.get("/",(req,res) =>{
    res.render("home");
});
app.get("/home1",(req,res) =>{
    res.render("home1");
});
app.get("/login",(req, res) =>{
        res.render("login");
    });

app.get("/signup",(req,res) => {
    res.render("signup");
});
app.get("/home", (req, res) => {
    console.log("Rendering home page");
    res.render("home");
});
app.get("/slotbooking", (req, res) => {
    res.render("slotbooking");
});
app.get("/stationA",(req,res)=>{
    res.render("stationA");
});
app.get("/stationB",(req,res)=>{
    res.render("stationB");
});

//register
app.post("/signup",async (req,res)=>{
const data={
    name: req.body.username,
    email:req.body.email,
    password :req.body.password
}

//check if user already exist
const existingUser=await collection.findOne({email: data.email});

if(existingUser){
    return res.send("User already exist try another");
}
else{
    //hash password use bcrypy
    const saltRounds=10;//no.of salt round for bcrypt
    const hashedPassword=await bcrypt.hash(data.password,saltRounds);
    data.password=hashedPassword;

const userdata = await collection.insertMany([data]);
//console.log(userdata);
console.log("Redirecting to login page");
res.redirect("/login");

}
});

//login use
app.post("/login", async (req,res)=>{
try{
const check=await collection.findOne({name:req.body.username});
if(!check){
    
    //req.flash('error', 'User not found. Please sign up.');
    return res.redirect("/signup");
}
//compare hashpassword
const ispasswordmatch=await bcrypt.compare(req.body.password,check.password);
if(ispasswordmatch){
    console.log("Home page");
    res.redirect("/home1");//rendering home page
}
else{
    res.send("Wrong password");
}


}
catch{
res.send("wrong detail");
}
});


//slotbooking
app.post("/slotbooking", async (req, res) => {
    try {
        const {
            username,
            registerNumber,
            yearOfStudying,
            station,
            vehicleType,
            startDate,
            startTime,
            endTime,
            college
        } = req.body;

        // Combine start date and time into a single Date object
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${startDate}T${endTime}`);

        const startHour = startDateTime.getHours();
        const endHour = endDateTime.getHours();

        if (startHour < 9 || startHour >= 17 || endHour < 9 || endHour > 17) {
            return res.status(400).send("Slot timings must be between 9:00 AM and 5:00 PM.");
        }

        // Check if slot already booked for the same station and overlapping time range
        const existingSlot = await SlotCollection.findOne({
            station,
            $or: [
                { startTime: { $lte: endDateTime, $gte: startDateTime } },
                { endTime: { $gte: startDateTime, $lte: endDateTime } }
            ]
        });

        if (existingSlot) {
            return res.status(400).send("Slot already booked for the selected time range and station. Please choose another slot.");
        }

        const slotBookingData = {
            username,
            registerNumber,
            yearOfStudying,
            station,
            vehicleType,
            startDate,
            startTime,
            endTime,
            college
        };

        const clonedSlotBookingData = { ...slotBookingData };

        const slotdata = await SlotCollection.insertMany([slotBookingData]);
        const cloned = await HistoryCollection.insertMany([clonedSlotBookingData]);
        res.send("Slot booked successfully!");
    } catch (error) {
        console.error("Error booking slot:", error);
        res.status(500).send("Error booking slot. Please try again later.");
    }
});



app.get("/history", (req, res) => {
    res.render("history",{ slotHistory:null});
});

app.post("/history", async (req, res) => {
    try {
        const  register = req.body.registerNumber; // Assuming 'startDate' is provided as YYYY-MM-DD format

        if (!register) {
            console.error("register is not provided");
            return res.status(400).send("Start date is required.");
        }

        // Construct start and end date for querying
        

        // Query history collection based on date range and time range
        const slotHistory = await HistoryCollection.find({
            registerNumber:register
        });

        console.log("Fetched slot history:", slotHistory);

        res.render("history", { slotHistory});
    } catch (error) {
        console.error("Error fetching slot history:", error);
        res.status(500).send("Error fetching slot history. Please try again later.");
    }
});

app.get("/admin", (req, res) => {
    res.render("admin",{ slotHistory1:null});
});

app.post("/admin", async (req, res) => {
    try {
        const passkey = req.body.passkey;

        if (passkey === "mona@123") {
            const date = req.body.startDate; // Assuming 'startDate' is provided as YYYY-MM-DD format

            // Check if the date is valid
            if (!date || isNaN(Date.parse(date))) {
                return res.status(400).send("Invalid date format. Please provide a valid start date in YYYY-MM-DD format.");
            }

            // Query history collection based on the provided start date
            const slotHistory1 = await HistoryCollection.find({ startDate: date });

            console.log("Fetched slot history:", slotHistory1);

            res.render("admin", { slotHistory1 });
        } else {
            res.status(403).send("You are not an admin. You cannot access this data.");
        }
    } catch (error) {
        console.error("Error fetching slot history:", error);
        res.status(500).send("Error fetching slot history. Please try again later.");
    }
});



const port=5000;
app.listen(port,() =>{
    console.log("server running");
});

