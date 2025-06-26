import mongoose from "mongoose";
const assignmentSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        required: true, 
        default: () => new mongoose.Types.ObjectId().toString() 
    },
    title: { type: String, required: true, default: "New Assignment" },
    course: { type: String, ref: "CourseModel", required: true },
    description: { type: String, default: "" },
    points: { type: Number, default: 100 },
    dueDate: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // 一周后
    availableDate: { type: Date, default: () => new Date() },
    availableUntil: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) } // 两周后
}, { collection: "assignments" });
export default assignmentSchema;
