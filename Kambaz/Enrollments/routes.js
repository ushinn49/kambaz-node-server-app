import * as dao from "./dao.js";

export default function EnrollmentRoutes(app) {
  
  // Route to enroll the current session user in a course
  const enrollInCourse = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.status(401).json({ message: "You must be logged in to enroll." });
      return;
    }
    const { courseId } = req.params;
    const newEnrollment = dao.enrollUserInCourse(currentUser._id, courseId);
    res.json(newEnrollment);
  };

  // Route to unenroll the current session user from a course
  const unenrollFromCourse = (req, res) => {
    const currentUser = req.session["currentUser"];
     if (!currentUser) {
      res.status(401).json({ message: "You must be logged in to unenroll." });
      return;
    }
    const { courseId } = req.params;
    const status = dao.unenrollUserFromCourse(currentUser._id, courseId);
    res.json(status);
  };

  // Route to get all courses a user is enrolled in
  const findCoursesForUser = (req, res) => {
      const { userId } = req.params;
      const enrollments = dao.findEnrollmentsForUser(userId);
      res.json(enrollments);
  }

  app.post("/api/courses/:courseId/enroll", enrollInCourse);
  app.delete("/api/courses/:courseId/unenroll", unenrollFromCourse);
  app.get("/api/users/:userId/enrollments", findCoursesForUser);
}