import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
  
  const signin = (req, res) => {
    const { username, password } = req.body;
    const currentUser = dao.findUserByCredentials(username, password);
    if (currentUser) {
      req.session["currentUser"] = currentUser;
      res.json(currentUser);
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  };

  const profile = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      // If there is no user in the session, send 401, not 500.
      res.status(401).json({ message: "You are not logged in." });
      return;
    }
    res.json(currentUser);
  };

  // This is the route that was likely causing the 500 Internal Server Error.
  // It now has a check to ensure a user is logged in before proceeding.
  const createCourseForUser = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.status(401).json({ message: "You must be logged in to create a course." });
      return;
    }
    const newCourse = courseDao.createCourse(req.body);
    enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
    res.json(newCourse);
  };
  
  const findCoursesForEnrolledUser = (req, res) => {
    // This safety check is critical.
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.status(401).json({ message: "You must be logged in to see your courses." });
      return;
    }
    const courses = courseDao.findCoursesForEnrolledUser(currentUser._id);
    res.json(courses);
  };

  // Other routes like signup, signout, updateUser...
  const signup = (req, res) => {
    const user = dao.findUserByUsername(req.body.username);
    if (user) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }
    const newUser = dao.createUser(req.body);
    req.session["currentUser"] = newUser;
    res.json(newUser);
  };

  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };


  // MAPPING PATHS TO HANDLERS
  app.post("/api/users/signin", signin);
  app.post("/api/users/profile", profile);
  app.post("/api/users/signup", signup);
  app.post("/api/users/signout", signout);
  
  // Notice the route for getting courses is now simplified as it uses the session.
  app.get("/api/users/current/courses", findCoursesForEnrolledUser);
  app.post("/api/users/current/courses", createCourseForUser);
}