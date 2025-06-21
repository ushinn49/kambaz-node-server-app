import * as coursesDao from "./dao.js";
import * as modulesDao from "../Modules/dao.js";
import * as assignmentsDao from "../Assignments/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function CourseRoutes(app) {
    const findAllCourses = async (req, res) => {
        const courses = await coursesDao.findAllCourses();
        res.json(courses);
    };

    const createCourse = async (req, res) => {
        const newCourse = await coursesDao.createCourse(req.body);
        const currentUser = req.session["currentUser"];
        if (currentUser) {
            await enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
        }
        res.json(newCourse);
    };

    const deleteCourse = async (req, res) => {
        const { courseId } = req.params;
        const status = await coursesDao.deleteCourse(courseId);
        res.json(status);
    };

    const updateCourse = async (req, res) => {
        const { courseId } = req.params;
        const status = await coursesDao.updateCourse(courseId, req.body);
        res.json(status);
    };

    const findModulesForCourse = async (req, res) => {
        const { courseId } = req.params;
        const modules = await modulesDao.findModulesForCourse(courseId);
        res.json(modules);
    };
    
    const createModuleForCourse = async (req, res) => {
        const { courseId } = req.params;
        const newModule = await modulesDao.createModule({
            ...req.body,
            course: courseId,
        });
        res.json(newModule);
    };
    
    const findAssignmentsForCourse = async (req, res) => {
        const { courseId } = req.params;
        const assignments = await assignmentsDao.findAssignmentsForCourse(courseId);
        res.json(assignments);
    };

    const createAssignmentForCourse = async (req, res) => {
        const { courseId } = req.params;
        const newAssignment = await assignmentsDao.createAssignment({
            ...req.body,
            course: courseId,
        });
        res.json(newAssignment);
    };
    
    const findUsersForCourse = async (req, res) => {
        const { courseId } = req.params;
        const users = await enrollmentsDao.findUsersForCourse(courseId);
        res.json(users);
    };

    app.get("/api/courses", findAllCourses);
    app.post("/api/courses", createCourse);
    app.delete("/api/courses/:courseId", deleteCourse);
    app.put("/api/courses/:courseId", updateCourse);
    app.get("/api/courses/:courseId/modules", findModulesForCourse);
    app.post("/api/courses/:courseId/modules", createModuleForCourse);
    app.get("/api/courses/:courseId/assignments", findAssignmentsForCourse);
    app.post("/api/courses/:courseId/assignments", createAssignmentForCourse);
    app.get("/api/courses/:courseId/users", findUsersForCourse);
}