import * as dao from "./dao.js";

export default function AssignmentRoutes(app) {
    const findAllAssignments = async (req, res) => {
        try {
            const assignments = await dao.findAllAssignments();
            res.json(assignments);
        } catch (error) {
            console.error("Error finding all assignments:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    };
    
    const deleteAssignment = async (req, res) => {
        try {
            const { assignmentId } = req.params;
            console.log(`API: Deleting assignment: ${assignmentId}`);
            
            const status = await dao.deleteAssignment(assignmentId);
            console.log("API: Delete status:", status);
            
            res.json(status);
        } catch (error) {
            console.error("API Error deleting assignment:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    };
    
    const updateAssignment = async (req, res) => {
        try {
            const { assignmentId } = req.params;
            console.log(`API: Updating assignment: ${assignmentId}`, req.body);
            
            const status = await dao.updateAssignment(assignmentId, req.body);
            console.log("API: Update status:", status);
            
            res.json(status);
        } catch (error) {
            console.error("API Error updating assignment:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    };
    
    const getAssignment = async (req, res) => {
        try {
            const { assignmentId } = req.params;
            const assignment = await dao.findAssignmentById(assignmentId);
            
            if (!assignment) {
                return res.status(404).json({ message: "Assignment not found" });
            }
            
            res.json(assignment);
        } catch (error) {
            console.error("API Error getting assignment:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    };
    
    // 添加路由
    app.get("/api/assignments", findAllAssignments);
    app.get("/api/assignments/:assignmentId", getAssignment);
    app.delete("/api/assignments/:assignmentId", deleteAssignment);
    app.put("/api/assignments/:assignmentId", updateAssignment);
}
