import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export const findAllCourses = () => model.find();
export const createCourse = (course) => {
    if (!course._id) {
        course._id = uuidv4();
    }
    return model.create(course);
};
export const deleteCourse = (courseId) => model.deleteOne({ _id: courseId });
export const updateCourse = (courseId, course) => model.updateOne({ _id: courseId }, { $set: course });
export const findCourseById = (courseId) => model.findById(courseId);
