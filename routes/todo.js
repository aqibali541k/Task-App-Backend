const express = require("express");
const router = express.Router();
const Todo = require("../models/todosSchema");
const authMiddleware = require("../middleware/authmiddleware");

router.use(authMiddleware);

router.post("/create", async (req, res) => {
    try {
        const { task, priority } = req.body;

        if (!task) {
            return res.status(400).json({ message: "task must be filled" });
        }

        const todo = new Todo({ task, priority, userId: req.user.id });
        await todo.save();

        res.status(201).json({ message: "Todo created successfully", todo });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/read", async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user.id }).sort({ _id: -1 })
        res.status(200).json({ message: "Todos fetched successfully", todos })
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})
router.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { task, priority } = req.body;
        const todo = await Todo.findByIdAndUpdate(id, { task, priority }, { new: true })
        res.status(200).json({ message: "Todo updated successfully", todo })
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})
router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const todo = await Todo.findByIdAndDelete(id)
        res.status(200).json({ message: "Todo deleted successfully", todo })
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})
module.exports = router;