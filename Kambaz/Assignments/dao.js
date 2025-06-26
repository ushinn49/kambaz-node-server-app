import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export const findAllAssignments = () => model.find();

export const findAssignmentById = (assignmentId) => model.findById(assignmentId);

export const findAssignmentsForCourse = (courseId) => model.find({ course: courseId });

export const createAssignment = async (assignment) => {
    try {
        console.log("Creating assignment:", assignment);
        
        // 确保有_id
        if (!assignment._id) {
            assignment._id = uuidv4();
        }
        
        // 确保有课程ID
        if (!assignment.course) {
            throw new Error("Course ID is required");
        }
        
        const newAssignment = await model.create(assignment);
        console.log("Created assignment:", newAssignment);
        return newAssignment;
    } catch (error) {
        console.error("Error creating assignment:", error);
        throw error;
    }
};

export const deleteAssignment = async (assignmentId) => {
    try {
        console.log("Deleting assignment:", assignmentId);
        const result = await model.deleteOne({ _id: assignmentId });
        console.log("Delete result:", result);
        return result;
    } catch (error) {
        console.error("Error deleting assignment:", error);
        throw error;
    }
};

export const updateAssignment = async (assignmentId, assignment) => {
    try {
        console.log("Updating assignment:", assignmentId, assignment);
        
        // 不要更新_id和course字段
        const { _id, course, ...updateData } = assignment;
        
        const result = await model.updateOne(
            { _id: assignmentId }, 
            { $set: updateData }
        );
        
        console.log("Update result:", result);
        return result;
    } catch (error) {
        console.error("Error updating assignment:", error);
        throw error;
    }
};
