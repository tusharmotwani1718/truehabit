import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const groupInvitationSchema = new Schema({
    groupId: {
        type: Schema.Types.ObjectId,
        ref: "Group",
        required: true,
    },
    inviterId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    invitedUserId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending",
    }
}, { timestamps: true });

groupInvitationSchema.plugin(mongooseAggregatePaginate);

export const GroupInvitation = mongoose.model("GroupInvitation", groupInvitationSchema);