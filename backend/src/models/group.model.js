import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const groupSchema = new Schema({
    groupName: {
        type: String,
        required: true
    },
    groupDesc: {
        type: String,
        default: ""
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }

}, { timestamps: true });



groupSchema.virtual("habits", {
    ref: "GroupHabit",
    localField: "_id",       // group._id
    foreignField: "groupId", // groupHabit.groupId
});

groupSchema.set("toObject", { virtuals: true });
groupSchema.set("toJSON", { virtuals: true });


groupSchema.plugin(mongooseAggregatePaginate);
export const Group = mongoose.model("Group", groupSchema);