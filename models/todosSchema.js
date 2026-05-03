const mongoose = require("mongoose");
const todosSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    task: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ["high", "medium", "low"],
        default: "medium"
    },
})

module.exports = mongoose.model("Todo", todosSchema);