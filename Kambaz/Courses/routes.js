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
        try {
            const { courseId } = req.params;
            console.log(`API: Finding assignments for course: ${courseId}`);
            
            const assignments = await assignmentsDao.findAssignmentsForCourse(courseId);
            console.log(`API: Found ${assignments.length} assignments for course ${courseId}`);
            
            res.json(assignments);
        } catch (error) {
            console.error(`API: Error finding assignments for course ${req.params.courseId}:`, error);
            res.status(500).json({ message: "Error finding assignments for course", error: error.message });
        }
    };

    const createAssignmentForCourse = async (req, res) => {
        try {
            const { courseId } = req.params;
            console.log(`API: Creating assignment for course: ${courseId}`, req.body);
            
            const assignmentData = {
                ...req.body,
                course: courseId
            };
            
            // 确保至少有标题
            if (!assignmentData.title) {
                assignmentData.title = "New Assignment";
            }
            
            const newAssignment = await assignmentsDao.createAssignment(assignmentData);
            console.log("API: Created assignment:", newAssignment);
            
            res.json(newAssignment);
        } catch (error) {
            console.error("API Error creating assignment:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
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
