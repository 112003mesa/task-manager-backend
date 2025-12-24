import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        default: "Employee"
    },
    role: {
        type: String,
        default: "Member"
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task"
        },
    ]
}, {timestamps: true})

const User = mongoose.model("User", userSchema)


export default User