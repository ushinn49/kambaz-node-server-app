import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        required: true, 
        default: () => new mongoose.Types.ObjectId().toString() 
    },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    email: { type: String, default: "" },
    dob: { type: Date, default: null },
    role: {
        type: String,
        enum: ["STUDENT", "FACULTY", "ADMIN", "USER"],
        default: "STUDENT",
    },
    loginId: String,
    section: String,
    lastActivity: Date,
    totalActivity: String,
}, { collection: "users" });
export default userSchema;
