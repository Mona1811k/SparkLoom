const mongoose=require("mongoose");
const connect=mongoose.connect("mongodb://localhost:27017/admin");

connect.then(()=>{

    console.log("Database connected successfully");

})
.catch(()=>{
    console.log("database not connected");
});

const LoginSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
});
const SlotBookingSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    registerNumber: {
        type: String,
        required: true
    },
    yearOfStudying: {
        type: String,
        required: true
    },
    station: {
        type: String,
        enum: ['StationA', 'StationB'],
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['Car', 'Bike'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String, // Using String for time, e.g., "09:00"
        required: true
    },
    endTime: {
        type: String, // Using String for time, e.g., "11:00"
        required: true
    },
    college: {
        type: String,
        required: true
    }
});




const collection=mongoose.model("users",LoginSchema);
const SlotCollection =mongoose.model("slots", SlotBookingSchema);
const HistoryCollection = mongoose.model("histories", SlotBookingSchema);

module.exports = {
    collection,
    SlotCollection,
    HistoryCollection
};