import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const habitSchema = new Schema({
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
        type: Date,
        default: Date.now, // Mongoose will automatically store the current UTC time
        required: true
    },
    endDate: {
        type: Date,
        default: Date.now, // Mongoose will automatically store the current UTC time
        required: true
    },
    frequency: {
        type: Number,
        // enum: ['daily', 'everysecondday', 'everythirdday', 'weekly', 'monthly'],
        enum: [1, 2, 3, 7, 30],
        default: 'daily',
    },
    completedDays:[
        // contains array of all the days at which user completed the habit.
        {
            type: Date,
            required: true
        }
    ],
    status:{
        type: String,
        enum: ['active', 'expired', 'completed'],
        default: 'active'
    },
    userID: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })


habitSchema.plugin(mongooseAggregatePaginate)


export const Habit = mongoose.model("Habit", habitSchema);
