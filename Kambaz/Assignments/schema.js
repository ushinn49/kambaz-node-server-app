import mongoose from "mongoose";
const assignmentSchema = new mongoose.Schema({
    _id: String,
    title: String,
    course: { type: String, ref: "CourseModel" },
    description: String,
    points: Number,
    dueDate: Date,
    availableDate: Date,
    availableUntil: Date
}, { collection: "assignments" });
export default assignmentSchema;