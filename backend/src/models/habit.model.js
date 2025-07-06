import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Note Subschema
const noteSchema = new Schema(
  {
    note: {
      type: String,
      minlength: [5, "Minimum Length is 5 characters."],
      maxlength: [250, "Maximum Length is 250 characters."]
    }
  },
  {
    timestamps: true,
    _id: true
  }
);

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
        enum: [1, 2, 3, 7, 30], // 1=daily, 2=every second day, ..., 30=monthly
        default: 1,
    },
    completedDays: [
        // contains array of all the days at which user completed the habit.
        {
            type: String,
            required: true
        }
    ],
    status: {
        type: String,
        enum: ['active', 'expired', 'completed'],
        default: 'active'
    },
    notes: [
        noteSchema
    ],
    userID: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })


habitSchema.plugin(mongooseAggregatePaginate)


export const Habit = mongoose.model("Habit", habitSchema);
