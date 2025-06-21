import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export const findModulesForCourse = (courseId) => model.find({ course: courseId });
export const createModule = (module) => {
    // Generate a unique ID if not provided
    if (!module._id) {
        module._id = uuidv4();
    }
    return model.create(module);
};
export const deleteModule = (moduleId) => model.deleteOne({ _id: moduleId });
export const updateModule = (moduleId, module) => model.updateOne({ _id: moduleId }, { $set: module });