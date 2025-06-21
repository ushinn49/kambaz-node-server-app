import * as dao from "./dao.js";
export default function AssignmentRoutes(app) {
    const deleteAssignment = async (req, res) => {
        const status = await dao.deleteAssignment(req.params.assignmentId);
        res.json(status);
    };
    const updateAssignment = async (req, res) => {
        const { assignmentId } = req.params;
        const status = await dao.updateAssignment(assignmentId, req.body);
        res.json(status);
    };
    app.delete("/api/assignments/:assignmentId", deleteAssignment);
    app.put("/api/assignments/:assignmentId", updateAssignment);
}