import Database from "../Database/index.js";
import { v4 as uuidv4 } from "uuid";

// This function is from the textbook 
export function enrollUserInCourse(userId, courseId) {
  const { enrollments } = Database;
  const newEnrollment = { _id: uuidv4(), user: userId, course: courseId };
  enrollments.push(newEnrollment);
  return newEnrollment;
}

// This function is required for the unenroll feature
export function unenrollUserFromCourse(userId, courseId) {
    Database.enrollments = Database.enrollments.filter(
        (e) => !(e.user === userId && e.course === courseId)
    );
    return { status: "OK" };
}

// This function can be used to find all enrollments for a specific user
export function findEnrollmentsForUser(userId) {
    return Database.enrollments.filter((e) => e.user === userId);
}