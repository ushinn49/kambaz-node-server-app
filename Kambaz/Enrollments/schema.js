import mongoose from "mongoose";
const enrollmentSchema = new mongoose.Schema({
    _id: String,
    user: { type: String, ref: "UserModel" },
    course: { type: String, ref: "CourseModel" },
    grade: Number,
    letterGrade: String,
    enrollmentDate: Date,
    status: {
        type: String,
        enum: ["ENROLLED", "DROPPED", "COMPLETED"],
        default: "ENROLLED",
    },
}, { collection: "enrollments" });
export default enrollmentSchema;