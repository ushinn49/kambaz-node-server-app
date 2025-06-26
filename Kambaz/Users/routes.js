import * as dao from "./dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
    const createUser = async (req, res) => {
        const user = await dao.createUser(req.body);
        res.json(user);
    };

    const deleteUser = async (req, res) => {
        const status = await dao.deleteUser(req.params.userId);
        res.json(status);
    };

    const findAllUsers = async (req, res) => {
        const { role, name } = req.query;
        if (role) {
            const users = await dao.findUsersByRole(role);
            res.json(users);
            return;
        }
        if (name) {
            const users = await dao.findUsersByPartialName(name);
            res.json(users);
            return;
        }
        const users = await dao.findAllUsers();
        res.json(users);
    };

    const findUserById = async (req, res) => {
        const user = await dao.findUserById(req.params.userId);
        res.json(user);
    };

    const updateUser = async (req, res) => {
        const { userId } = req.params;
        const status = await dao.updateUser(userId, req.body);
        const currentUser = await dao.findUserById(userId);
        req.session["currentUser"] = currentUser;
        res.json(status);
    };

    const signup = async (req, res) => {
        const user = await dao.findUserByUsername(req.body.username);
        if (user) {
            res.status(400).json({ message: "Username already taken" });
            return;
        }
        const currentUser = await dao.createUser(req.body);
        req.session["currentUser"] = currentUser;
        res.json(currentUser);
    };

    const signin = async (req, res) => {
        try {
            const { username, password } = req.body;
            console.log("Login attempt:", { username, password });
            const currentUser = await dao.findUserByCredentials(username, password);
            if (currentUser) {
                req.session["currentUser"] = currentUser;
                console.log("User authenticated:", currentUser);
                res.json(currentUser);
            } else {
                console.log("Authentication failed: Invalid credentials");
                res.status(401).json({ message: "Invalid credentials" });
            }
        } catch (error) {
            console.error("Signin error:", error);
            res.status(500).json({ message: "Server error during signin" });
        }
    };

    const signout = (req, res) => {
        req.session.destroy();
        res.sendStatus(200);
    };

    const profile = (req, res) => {
        try {
            console.log("Session:", req.session);
            const currentUser = req.session["currentUser"];
            if (!currentUser) {
                console.log("No user in session");
                res.status(401).json({ message: "Not authenticated" });
                return;
            }
            console.log("Profile request for user:", currentUser);
            res.json(currentUser);
        } catch (error) {
            console.error("Profile error:", error);
            res.status(500).json({ message: "Server error accessing profile" });
        }
    };
    
    const enrollUserInCourse = async (req, res) => {
        const { userId, courseId } = req.params;
        const enrollment = await enrollmentsDao.enrollUserInCourse(userId, courseId);
        res.json(enrollment);
    };

    const unenrollUserFromCourse = async (req, res) => {
        const { userId, courseId } = req.params;
        const status = await enrollmentsDao.unenrollUserFromCourse(userId, courseId);
        res.json(status);
    };

    const findCoursesForUser = async (req, res) => {
        const { userId } = req.params;
        const courses = await enrollmentsDao.findCoursesForUser(userId);
        res.json(courses);
    };

    app.post("/api/users", createUser);
    app.get("/api/users", findAllUsers);
    app.get("/api/users/:userId", findUserById);
    app.put("/api/users/:userId", updateUser);
    app.delete("/api/users/:userId", deleteUser);
    app.post("/api/users/signup", signup);
    app.post("/api/users/signin", signin);
    app.post("/api/users/signout", signout);
    app.post("/api/users/profile", profile);
    app.post("/api/users/:userId/courses/:courseId", enrollUserInCourse);
    app.delete("/api/users/:userId/courses/:courseId", unenrollUserFromCourse);
    app.get("/api/users/:userId/courses", findCoursesForUser);
}
