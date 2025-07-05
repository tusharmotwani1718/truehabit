import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const groupHabitSchema = new Schema({
    groupId: {
        type: Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    habitName: {
        type: String,
        required: true
    },
    habitDesc: {
        type: String,
        maxlength: [250, "Maximum Length is 250 characters."],
        minlength: [5, "Minimum Length is 5 characters."]
    },
    habitCategory: {
        type: String,
        enum: ["Personal", "Fitness", "Academics", "Relationship", "Spirituality", "Career", "Growth", "Work", "Others"],
        default: "Others"
    },
    startDate: {
        type: String,
        required: true
    },
    endDate: {
        type: String,
        required: true
    },
    frequency: {
        type: Number,
        // enum: ['daily', 'everysecondday', 'everythirdday', 'weekly', 'monthly'],
        enum: [1, 2, 3, 7, 30],
        default: 'daily',
    },
    status: {
        type: String,
        enum: ["active", "expired"],
        default: "active"
    },
    users: [
        // users is an array that contains two things:
        {
            _id: false,
            // 1. user: user id
            user: {
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            // 2. dates: array of completed dates (strings)
            dates: {
                type: [String],
                default: [],
            },
        },
    ]
}, { timestamps: true });


groupHabitSchema.plugin(mongooseAggregatePaginate);
export const GroupHabit = mongoose.model("GroupHabit", groupHabitSchema);