import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Group } from "../models/group.model.js";
import dotenv from 'dotenv';
import { User } from "../models/user.model.js";
import { GroupHabit } from "../models/grouphabit.model.js";
import { DateTime } from "luxon";
import mongoose from "mongoose";
import { GroupInvitation } from "../models/groupInvitation.js";
import { compareDatesWithoutTime } from "../../../shared/functions/CompareDates.js";




dotenv.config();

// In this controller all the routes would be requiring authentication on login (Verify JWT) as you can perform no action on your groups until you are logged in.


// Route 1: Get your group
const getGroups = asyncHandler(async (req, res) => {
    const groups = await User.findById(req.user?._id)
        .populate({
            path: "groups",
            populate: [
                {
                    path: "admin", // Populate the admin (User) inside each group
                    select: "username fullName email", // Only select needed fields
                },
                {
                    path: "habits", // Virtual field
                    select: "habitName users -_id -groupId"
                }
            ]
        })
        .select("groups");

    if (!groups) {
        throw new ApiError(400, "Group not found.");
    }

    res.status(200).json(
        new ApiResponse(201, groups, "Groups fetched successfully.")
    )
})


// Route 2: Create a group
const createGroup = asyncHandler(async (req, res) => {
    const { groupName, groupDesc, habitName, habitDesc, habitCategory, startDate, endDate, frequency } = req.body;

    // const currentDate = DateTime.now().setZone('Asia/Kolkata').startOf('day');
    const currentDate = DateTime.now().setZone('Asia/Kolkata').startOf('day');
    const currentDateString = currentDate.toFormat('yyyy-MM-dd');

    if (!startDate || !endDate) {
        throw new ApiError(401, "Start date and end date is required.");
    }

    // const startDateObj = DateTime.fromISO(startDate, { zone: 'Asia/Kolkata' }).startOf('day');
    // const endDateObj = DateTime.fromISO(endDate, { zone: 'Asia/Kolkata' }).startOf('day');
    const startDateObj = DateTime.fromISO(startDate, { zone: 'Asia/Kolkata' }).setZone('Asia/Kolkata').startOf('day');
    const startDateString = startDateObj.toFormat('yyyy-MM-dd');
    const endDateObj = DateTime.fromISO(endDate, { zone: 'Asia/Kolkata' }).setZone('Asia/Kolkata').startOf('day');
    const endDateString = endDateObj.toFormat('yyyy-MM-dd');

    // if (startDateObj < currentDate || endDateObj < currentDate) {
    //     throw new ApiError(400, "Invalid Dates.");
    // }

    if (startDateString < currentDateString || endDateString < currentDateString) {
        throw new ApiError(400, "Invalid Dates.");
    }

    // if (startDateObj > endDateObj) {
    //     throw new ApiError(400, "End date should be greater than start date.");
    // }

    if (startDateString > endDateString) {
        throw new ApiError(400, "End date should be greater than start date.");
    }

    const admin = req.user?._id;
    
    const user = User.findById(admin);

    if(!admin || !user){
        throw new ApiError(401, "User not found");
    }

    if(!user.isEmailVerified){
        throw new ApiError(401, "Please verify your email first.");
    }

    // 1. Create group
    const group = await Group.create({
        groupName,
        groupDesc,
        admin
    });

    if (!group) {
        throw new ApiError(400, "Group creation failed.");
    }

    // 2. Add group to user's list
    const addToUser = await User.findByIdAndUpdate(admin, {
        $push: {
            groups: group._id
        }
    }, { new: true });

    if (!addToUser) {
        throw new ApiError(400, "Group creation failed.");
    }

    // 3. Add habit to group
    // const addToGrouphabits = await GroupHabit.create({
    //     groupId: group._id,
    //     habitName,
    //     habitDesc,
    //     habitCategory,
    //     startDate: new Date(
    //         startDateObj.year,
    //         startDateObj.month - 1,
    //         startDateObj.day,
    //         startDateObj.hour,
    //         startDateObj.minute,
    //         startDateObj.second,
    //         startDateObj.millisecond
    //     ),
    //     endDate: new Date(
    //         endDateObj.year,
    //         endDateObj.month - 1,
    //         endDateObj.day,
    //         endDateObj.hour,
    //         endDateObj.minute,
    //         endDateObj.second,
    //         endDateObj.millisecond
    //     ),
    //     frequency,
    //     users: [
    //         {
    //             user: admin,
    //             dates: []
    //         }
    //     ]
    // });
    const addToGrouphabits = await GroupHabit.create({
        groupId: group._id,
        habitName,
        habitDesc,
        habitCategory,
        startDate: startDateString,
        endDate: endDateString,
        frequency,
        users: [
            {
                user: admin,
                dates: []
            }
        ]
    });

    if (!addToGrouphabits) {
        throw new ApiError(400, "Group creation failed.");
    }

    // 4. Populate admin details in group
    const populatedGroup = await Group.findById(group._id)
        .populate({
            path: "admin",
            select: "username email fullName profileImage"
        });

    res.status(200).json(
        new ApiResponse(201, {
            group: populatedGroup,
            habit: addToGrouphabits
        }, "Group created successfully.")
    );
});



// Route 3: Delete a group:
const deleteGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.body;

    if (!groupId) {
        throw new ApiError(400, "Group id is required.");
    }

    const group = await Group.findById(groupId);
    if (!group) {
        throw new ApiError(400, "Group not found.");
    }


    // check if the group belongs to the user as admin:
    const adminId = req.user?._id;
    const user = await User.findById(adminId);

    if(!user.isEmailVerified){
        throw new ApiError(401, "Please verify your email first.");
    }
    // console.log(adminId, group.admin);
    // console.log(adminId.toString() === group.admin.toString());
    if (group.admin.toString() !== adminId.toString()) {
        throw new ApiError(400, "You are not allowed to delete this group.");
    }

    // delete the group from all the users:
    const deletefromAllusers = await User.updateMany({ groups: groupId }, {
        $pull: {
            groups: groupId
        }
    }, { new: true });

    if (!deletefromAllusers) {
        throw new ApiError(400, "Group deletion failed.");
    }

    // delete the group from the groupHabit:
    const deleteFromGroupHabit = await GroupHabit.deleteOne({ groupId: groupId });
    if (!deleteFromGroupHabit) {
        throw new ApiError(400, "Group deletion failed.");
    }

    // delete the group invitations:
    const deleteInvitations = await GroupInvitation.deleteMany({ groupId: groupId });
    if (!deleteInvitations) {
        throw new ApiError(400, "Group deletion failed.");
    }

    // delete the group:
    await group.deleteOne();
    res.status(200).json(new ApiResponse(201, group, "Group deleted successfully."));

})


// Route 4: Invite a user to a group:
const inviteUser = asyncHandler(async (req, res) => {
    const { groupId, userId } = req.body;
    if (!groupId || !userId) {
        throw new ApiError(400, "Group id and user id are required.");
    }

    // find the group:
    const group = await Group.findById(groupId);

    if (!group) {
        throw new ApiError(400, "Group not found.");
    }


    // check if the requesting user is the admin:
    const adminId = req.user?._id;

    const admin = await User.findById(adminId);
    if(!admin.isEmailVerified){
        throw new ApiError(401, "Please verify your email first.");
    }

    if (group.admin.toString() !== adminId.toString()) {
        throw new ApiError(400, "You are not allowed to invite users to this group.");
    }



    // check if the number of members are more than 5:
    const groupHabit = await GroupHabit.findOne({ groupId: groupId });
    if (!groupHabit) {
        throw new ApiError(400, "Group habit not found.");
    }

    if (groupHabit.users.length >= 5) {
        throw new ApiError(400, "Maximum number of members reached.");
    }

    // check if the user is already in the group:
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(400, "User not found.");
    }

    const isUserInGroup = await User.findOne({ _id: userId, groups: groupId });
    if (isUserInGroup) {
        throw new ApiError(400, "User is already in the group.");
    }



    // send the invitation to the user:
    const invitation = await GroupInvitation.create({
        groupId: groupId,
        inviterId: adminId,
        invitedUserId: userId
    })

    if (!invitation) {
        throw new ApiError(400, "Unable inviting the user.");
    }






    res.status(200).json(new ApiResponse(201, user, "User invited successfully."));
})

// Route 5: getInvitations:
// This route is used to get all the invitations sent to the user.
const getInvitations = asyncHandler(async (req, res) => {
    const userId = req.user?._id;


    // get all the invitations:
    const invitations = await GroupInvitation.find({
        invitedUserId: userId,
    }).populate(
        {
            path: "groupId",
            select: "groupName groupDesc admin",
            populate: {
                path: "admin",
                select: "username fullName email profileImage"
            }

        }
    );



    if (!invitations) {
        throw new ApiError(400, "No invitations found.");
    }

    res.status(200).json(new ApiResponse(200, invitations, "Invitations fetched successfully."));
})

// Route 6: Accept/Decline an invitation:
const acceptDeclineInvitation = asyncHandler(async (req, res) => {
    const { invitationId, action } = req.body;

    if (!invitationId || !action) {
        throw new ApiError(400, "Invitation id and status are required.");
    }

    // get the invitation:
    const invitation = await GroupInvitation.findOne({ _id: invitationId, status: "pending" });
    if (!invitation) {
        throw new ApiError(400, "Invitation not found.");
    }

    // check if the user is the invited user:
    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(400, "User not found.");
    };

    if(!user.isEmailVerified){
        throw new ApiError(401, "Please verify your email first.");
    }

    if (invitation.invitedUserId.toString() !== userId.toString()) {
        throw new ApiError(400, "You are not allowed to accept/decline this invitation.");
    }


    // check the status and update the invitation:
    if (action === "accepted") {
        // add group id to the user:
        const user = await User.findByIdAndUpdate(userId, {
            $push: {
                groups: invitation.groupId
            }
        })

        if (!user) {
            throw new ApiError(400, "User not found.");
        }

        // add user to the group habit:
        const addToGroupHabit = await GroupHabit.findOneAndUpdate({ groupId: invitation.groupId }, {
            $push: {
                users: {
                    user: userId,
                    dates: []
                }
            }
        }, { new: true }).select("users");

        if (!addToGroupHabit) {
            throw new ApiError(400, "Unable inviting the user.");
        }

        // mark the invitation as accepted:
        invitation.status = "accepted";
        await invitation.save({ validateBeforeSave: false });
        res.status(200).json(new ApiResponse(200, invitation, "Invitation accepted successfully."));
    }

    else if (action === "declined") {
        // mark the invitation as declined: 
        invitation.status = "declined";
        await invitation.save({ validateBeforeSave: false });
        res.status(200).json(new ApiResponse(200, invitation, "Invitation declined successfully."));
    }

    else {
        throw new ApiError(400, "Invalid action.");
    }

})

// Route 7: Update a group:
const updateGroup = asyncHandler(async (req, res) => {
    const { groupId, newGroupName, newGroupDesc, newHabitName, newHabitDesc, newStartDate, newEndDate, newCategory } = req.body;

    if (!groupId) {
        throw new ApiError(400, "Group id is required.");
    }

    const group = await Group.findById(groupId);
    if (!group) {
        throw new ApiError(400, "Group not found.");
    }

    // check if the group belongs to the user:
    const adminId = req.user?._id;
    const user = await User.findById(adminId);
    if (!user) {
        throw new ApiError(400, "User not found.");
    };

    if(!user.isEmailVerified){
        throw new ApiError(401, "Please verify your email first.");
    };

    if (group.admin.toString() !== adminId.toString()) {
        throw new ApiError(400, "You are not allowed to update this group.");
    }


    // update the group:
    // throw error if there is no field to update:
    if (!newGroupName && !newGroupDesc && !newHabitName && !newHabitDesc && !newStartDate && !newEndDate && !newCategory) {
        throw new ApiError(400, "Required Fields are missing.");
    }

    // get the habit:
    const habit = await GroupHabit.findOne({ groupId: groupId });
    if (!habit) {
        throw new ApiError(400, "Group habit not found.");
    }

    const currentDate = DateTime.now().setZone("Asia/Kolkata").toFormat("yyyy-MM-dd");
    // console.log("currentDate Luxon", currentDate);


    const habitStartDate = DateTime.fromFormat(habit.startDate, "yyyy-MM-dd").setZone("Asia/Kolkata").toFormat("yyyy-MM-dd");



    // console.log("habitStartDate: ", habitStartDate);

    const habitEndDate = DateTime.fromFormat(habit.endDate, "yyyy-MM-dd").setZone("Asia/Kolkata").toFormat("yyyy-MM-dd");


    let formattedStartDate;
    let formattedEndDate;



    // if user has sent the start date to update:
    if (newStartDate && !newEndDate) {
        formattedStartDate = DateTime.fromISO(newStartDate).setZone("Asia/Kolkata").toFormat("yyyy-MM-dd");

        if (!formattedStartDate) {
            throw new ApiError(400, "Please pass a valid date format");
        }

        // we have to make some checks before updating the start date:
        // start date should not be before the current date:
        if (formattedStartDate < currentDate) {
            throw new ApiError(400, "Cannot set start date to the past.");
        }

        // start date should not be after the end date:
        if (formattedStartDate > habitEndDate) {
            throw new ApiError(400, "Cannot set start date after the end date.");
        }

    }

    // if user has sent end date to update:
    if (newEndDate && !newStartDate) {
        formattedEndDate = DateTime.fromISO(newEndDate).setZone("Asia/Kolkata").toFormat("yyyy-MM-dd");

        if (!formattedEndDate) {
            throw new ApiError(400, "Please pass a valid date format");
        }

        // end date should not be before current date:
        if (formattedEndDate < currentDate) {
            throw new ApiError(400, "Cannot set end date before current date.");
        }

        // end date should not be before start date:
        if (formattedEndDate < habitStartDate) {
            throw new ApiError("Cannot set end date before start date.");
        }

    }

    // user passes both start date and end date to update:
    if (newStartDate && newEndDate) {
        formattedStartDate = DateTime.fromISO(newStartDate).setZone("Asia/Kolkata").toFormat("yyyy-MM-dd");
        formattedEndDate = DateTime.fromISO(newEndDate).setZone("Asia/Kolkata").toFormat("yyyy-MM-dd");


        if (!formattedStartDate || !formattedEndDate) {
            throw new ApiError(400, "Please pass a valid date format for both dates.");
        }

        // start date cannot be before the current date:
        if (formattedStartDate < currentDate) {
            throw new ApiError(400, "Cannot set start date before current date.");
        }

        // new start date could not be greater than new end date:
        if (formattedStartDate > formattedEndDate) {
            throw new ApiError("Start date must be before the end date.");
        }
    }


    // update the group:
    if (newGroupName) group.groupName = newGroupName;
    if (newGroupDesc) group.groupDesc = newGroupDesc;

    await group.save({ validateBeforeSave: false });


    // const habit = await GroupHabit.findOne({ groupId: groupId });
    // if (!habit) {
    //     throw new ApiError(400, "Group habit not found.");
    // }

    // update the habit (Group-habit):
    if (newHabitName) habit.habitName = newHabitName;
    if (newHabitDesc) habit.habitDesc = newHabitDesc;
    if (newCategory) habit.habitCategory = newCategory;

    // if (newStartDate) {
    //     const startDateObj = DateTime.fromISO(newStartDate, { zone: 'Asia/Kolkata' }).startOf('day');
    //     habit.startDate = new Date(
    //         startDateObj.year,
    //         startDateObj.month - 1,
    //         startDateObj.day,
    //         startDateObj.hour,
    //         startDateObj.minute,
    //         startDateObj.second,
    //         startDateObj.millisecond
    //     );
    // }
    // if (newEndDate) {
    //     const endDateObj = DateTime.fromISO(newEndDate, { zone: 'Asia/Kolkata' }).startOf('day');
    //     habit.endDate = new Date(
    //         endDateObj.year,
    //         endDateObj.month - 1,
    //         endDateObj.day,
    //         endDateObj.hour,
    //         endDateObj.minute,
    //         endDateObj.second,
    //         endDateObj.millisecond
    //     );
    // }

    // save the date strings (if passed to update):
    if (newStartDate) {
        habit.startDate = formattedStartDate
    }

    if (newEndDate) {
        habit.endDate = formattedEndDate
    }


    await habit.save({ validateBeforeSave: false });


    res.status(200).json(new ApiResponse(200, habit, "Group habit updated successfully."));
})


// Route 8: Remove user from group:
const removeUser = asyncHandler(async (req, res) => {
    const { groupId, userId } = req.body;

    if (!groupId || !userId) {
        throw new ApiError(400, "Group id and user id are required.");
    }

    // find the group:
    const group = await Group.findById(groupId);

    if (!group) {
        throw new ApiError(400, "Group not found.");
    }

    const adminId = req.user?._id;

    const admin = await User.findById(adminId);
    if(!admin.isEmailVerified){
        throw new ApiError(401, "Please verify your email first.");
    }

    if (group.admin.toString() !== adminId.toString()) {
        throw new ApiError(400, "You are not allowed to remove users from this group.");
    }

    if (group.admin.toString() === userId.toString()) {
        throw new ApiError(400, "You cannot remove the admin from the group. Try deleting the group instead.");
    }

    // remove user from the groupHabit:
    const removeFromGroupHabit = await GroupHabit.findOneAndUpdate({ groupId: groupId }, {
        $pull: {
            users: {
                user: userId
            }
        }
    }, { new: true });

    if (!removeFromGroupHabit) {
        throw new ApiError(400, "Unable removing the user.");
    }

    // remove group id from the user:
    const removeFromUser = await User.findOneAndUpdate({ _id: userId }, {
        $pull: {
            groups: groupId
        }
    }, { new: true }).select("groups");


    if (!removeFromUser) {
        throw new ApiError(400, "User not found.");
    }

    res.status(200).json(new ApiResponse(200, removeFromUser, "User removed successfully."));

})


// Route 9: Leave a group:
const leaveGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.body;
    const userId = req.user?._id;

    const user = await User.findById(userId);
    if(!user.isEmailVerified){
        throw new ApiError(401, "Please verify your email first.");
    }

    if (!groupId) {
        throw new ApiError(400, "Group id is required.");
    }

    // find the group:
    const group = await Group.findById(groupId);

    if (!group) {
        throw new ApiError(400, "Group not found.");
    }

    // remove group id from the user:
    const removeFromUser = await User.findOneAndUpdate({ _id: userId }, {
        $pull: {
            groups: groupId
        }
    }, { new: true }).select("groups");

    if (!removeFromUser) {
        throw new ApiError(400, "User not found.");
    }

    res.status(200).json(new ApiResponse(200, removeFromUser, "Group left successfully."));

})


// Route 10: Expire group:
const expireGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.body;
    const userId = req.user?._id;

    if (!groupId) {
        throw new ApiError(400, "Group id is required.");
    }

    // find the group:
    const group = await Group.findById(groupId);
    if (!group) {
        throw new ApiError(400, "Group not found.");
    }

    if (group.admin.toString() !== userId.toString()) {
        throw new ApiError(400, "You are not allowed to expire this group.");
    }

    // const date = DateTime.now().setZone('Asia/Kolkata').endOf('day'); // set time at end of the day.
    const date = DateTime.now().setZone('Asia/Kolkata').toFormat('yyyy-MM-dd');

    // const expire = await GroupHabit.updateMany(
    //     { endDate: { $lt: date.toJSDate() } }, // Filter: Habits with endDate < current date
    //     { $set: { status: "expired" } }  // Update: Set status field to "expired"
    // );
    const expire = await GroupHabit.updateMany(
        { endDate: { $lt: date } }, // Filter: Habits with endDate < current date
        { $set: { status: "expired" } }  // Update: Set status field to "expired"
    );

    if (expire.matchedCount === 0) {
        throw new ApiError(500, "No habits to expire.");
    }

    res.status(200).json(
        new ApiResponse(201, `${expire.modifiedCount} habits have been marked as completed.`)
    );
});



// Route 11: Update habit completion of a user in a group:
const updateHabitCompletion = asyncHandler(async (req, res) => {
    const { groupId, completionDate } = req.body;
    const currentDate = DateTime.now().setZone('Asia/Kolkata');
    const currentDateString = currentDate.toFormat('yyyy-MM-dd');
    const completionDateObj = DateTime.fromISO(completionDate, { zone: 'Asia/Kolkata' }).setZone('Asia/Kolkata');
    const completionDateString = completionDateObj.toFormat('yyyy-MM-dd');

    const userId = req.user?._id;

    if (!groupId || !completionDate) {
        throw new ApiError(400, "Group id and completion date are required.");
    }

    const requestingUser = await User.findById(userId);
    if(!requestingUser.isEmailVerified){
        throw new ApiError(401, "Please verify your email first.");
    }

    // check whether the current date matches with completion date:
    // if (!compareDatesWithoutTime(currentDate.toJSDate(), completionDateObj.toJSDate())) {
    //     throw new ApiError(400, "Marking completion for future/past date is not allowed.");
    // }

    if (completionDateString !== currentDateString) {
        throw new ApiError(400, "Marking completion for future/past date is not allowed.");
    }

    // get the grouphabit:
    const habit = await GroupHabit.findOne({ groupId: groupId });
    if (!habit) {
        throw new ApiError(400, "Group habit not found.");
    }

    // check if the user is part of the group:
    const user = habit.users.find(user => user.user.toString() === userId.toString());
    if (!user) {
        throw new ApiError(400, "User not found in the group.");
    }

    const completedDays = user.dates;
    const frequency = habit.frequency;

    // Check if the completion date is within the valid range:
    // const startDate = DateTime.fromJSDate(habit.startDate).setZone('Asia/Kolkata').startOf('day');
    // const endDate = DateTime.fromJSDate(habit.endDate).setZone('Asia/Kolkata').startOf('day');

    const startDateObj = DateTime.fromFormat(habit.startDate, 'yyyy-MM-dd', { zone: "Asia/Kolkata" }).setZone('Asia/Kolkata').startOf('day');
    const startDateString = startDateObj.toFormat('yyyy-MM-dd');
    const endDateObj = DateTime.fromFormat(habit.endDate, 'yyyy-MM-dd', { zone: "Asia/Kolkata" }).setZone('Asia/Kolkata').startOf('day');
    const endDateString = endDateObj.toFormat('yyyy-MM-dd');


    // if (completionDateObj < startDate || completionDateObj > endDate) {
    //     throw new ApiError(400, "Date must be between the start and end dates.");
    // }

    if (completionDateString < startDateString || completionDateString > endDateString) {
        throw new ApiError(400, "Date must be between the start and end dates.");
    }

    // Ensure the maximum possible dates are not exceeded
    const totalDays = endDateObj.diff(startDateObj, 'days').days;
    const maxDates = Math.floor(totalDays / frequency) + 1;

    if (completedDays.length >= maxDates) {
        throw new ApiError(400, "Maximum possible completion dates have been reached.");
    }

    // ensure that the date is in the valid range as per the last date added:
    if (completedDays.length > 0) {
        const lastCompletedDate = completedDays[completedDays.length - 1];
        const lastDate = DateTime.fromFormat(lastCompletedDate, 'yyyy-MM-dd', { zone: "Asia/Kolkata" })
            .setZone('Asia/Kolkata')
            .startOf('day');
        const differenceInDays = Math.floor(completionDateObj.diff(lastDate, 'days').days);
        if (differenceInDays !== frequency && !(differenceInDays > frequency)) {
            throw new ApiError(400, "Invalid completion date as per last date of the habit.");
        }
    }

    // Add the completion date with IST time preserved:
    // const localDate = new Date(
    //     completionDateObj.year,
    //     completionDateObj.month - 1,
    //     completionDateObj.day,
    //     completionDateObj.hour,
    //     completionDateObj.minute,
    //     completionDateObj.second,
    //     completionDateObj.millisecond
    // );

    // const update = await GroupHabit.findOneAndUpdate(
    //     { groupId: groupId, "users.user": userId },
    //     { $push: { "users.$.dates": localDate } },
    //     { new: true }
    // );
    const update = await GroupHabit.findOneAndUpdate(
        { groupId: groupId, "users.user": userId },
        { $push: { "users.$.dates": completionDateString } },
        { new: true }
    );

    if (!update) {
        throw new ApiError(400, "Failed marking the habit as completed.");
    }

    res.status(200).json(new ApiResponse(200, update, "Habit marked as completed successfully."));
});




// Route 12: get today habits of a user in a group:
const getTodayHabits = asyncHandler(async (req, res) => {
    // const todayDate = DateTime.now().setZone('Asia/Kolkata').startOf('day');
    // const startOfDay = todayDate.toJSDate();
    // const endOfDay = todayDate.endOf('day').toJSDate();

    const currentDate = DateTime.now().setZone("Asia/Kolkata");
    const currentDateString = currentDate.toFormat('yyyy-MM-dd');

    const user = await User.findById(req.user?._id)
        .populate("groups")
        .select("groups");

    if (!user || !user.groups.length) {
        throw new ApiError(400, "No groups found for this user.");
    }

    if(!user.isEmailVerified){
        throw new ApiError(401, "Please verify your email first.");
    }

    const groupIds = user.groups.map(group => group._id);

    // const groupHabits = await GroupHabit.find({
    //     $and: [
    //         { groupId: { $in: groupIds } },
    //         { startDate: { $lte: endOfDay } },
    //         { endDate: { $gte: startOfDay } }
    //     ]
    // })
    //     .populate({
    //         path: 'groupId',
    //         select: 'groupName groupDesc admin',
    //         populate: {
    //             path: 'admin',
    //             select: 'username fullName profileImage'
    //         }
    //     });
    const groupHabits = await GroupHabit.find({
        $and: [
            { groupId: { $in: groupIds } },
            { startDate: { $lte: currentDateString } },
            { endDate: { $gte: currentDateString } }
        ]
    })
        .populate({
            path: 'groupId',
            select: 'groupName groupDesc admin',
            populate: {
                path: 'admin',
                select: 'username fullName profileImage'
            }
        });

    if (!groupHabits || !groupHabits.length) {
        throw new ApiResponse(200, [], "No group habits found for today.");
    }

    const userIdStr = req.user._id.toString();

    const filteredHabits = groupHabits.map(habit => {
        const userEntry = habit.users.find(u => u.user && u.user.toString() === userIdStr);
        const dates = userEntry ? userEntry.dates : [];

        const meetsCondition =
            (!dates || dates.length === 0) ||
            (() => {
                // const lastDate = DateTime.fromJSDate(dates[dates.length - 1]).setZone('Asia/Kolkata').startOf('day');
                // return lastDate.toMillis() === todayDate.toMillis();
                const lastDate = dates[dates.length - 1];
                const lastDateString = DateTime.fromFormat(lastDate, 'yyyy-MM-dd', {zone: "Asia/Kolkata"}).setZone('Asia/Kolkata').toFormat('yyyy-MM-dd');
                return lastDateString === currentDateString;
            })() ||
            (() => {
                // const lastDate = DateTime.fromJSDate(dates[dates.length - 1]).setZone('Asia/Kolkata').startOf('day');
                // const daysSinceLastCompletion = Math.floor(todayDate.diff(lastDate, 'days').days);
                // return daysSinceLastCompletion >= habit.frequency;
                const lastDate = dates[dates.length - 1];
                const lastDateObj = DateTime.fromFormat(lastDate, 'yyyy-MM-dd', {zone: "Asia/Kolkata"}).setZone('Asia/Kolkata').startOf('day');
                const daysSinceLastCompletion = Math.floor(currentDate.diff(lastDateObj, 'days').days);
                return daysSinceLastCompletion >= habit.frequency;

            })();

        return {
            ...habit.toObject(),
            meetsCondition,
            completedDays: dates
        };
    }).filter(habit => habit.meetsCondition);

    res.status(200).json(
        new ApiResponse(200, filteredHabits, "Group habits with user dates and group details fetched successfully.")
    );
});




// Route 13: Get habit completion of all users in a group:
// This route is used to get the details of all users in a group along with their habit completion status, streaks, etc.
const getUsersDetails = asyncHandler(async (req, res) => {
    let { groupId } = req.query;
    const userID = req.user?._id;

    if (typeof groupId === 'string') {
        groupId = new mongoose.Types.ObjectId(groupId);
    }

    if (!groupId) {
        throw new ApiError(400, "Group id is required.");
    }

    const group = await Group.findById(groupId).populate("admin", "fullName username email profileImage");
    if (!group) {
        throw new ApiError(400, "Group not found.");
    }

    const groupHabit = await GroupHabit.findOne({ groupId: groupId }).populate("users.user", "fullName username email profileImage");
    if (!groupHabit) {
        throw new ApiError(400, "Group habit not found.");
    }

    const userExistsinGroup = GroupHabit.find({
        users: { $elemMatch: { user: userID } }
    })

    if (!userExistsinGroup) {
        throw new ApiError(400, "You are not allowed to access the member details of this group.");
    }

    // const todayDate = new Date().setHours(0, 0, 0, 0);
    const todayDate = DateTime.now().setZone('Asia/Kolkata').startOf('day');
    const todayDateString = todayDate.toFormat('yyyy-MM-dd');

    const startDate = DateTime.fromFormat(groupHabit.startDate, 'yyyy-MM-dd', {zone: "Asia/Kolkata"}).setZone('Asia/Kolkata').startOf('day');
    const startDateString = startDate.toFormat('yyyy-MM-dd');
    const endDate = DateTime.fromFormat(groupHabit.endDate, 'yyyy-MM-dd', {zone: "Asia/Kolkata"}).setZone('Asia/Kolkata').startOf('day');
    const endDateString = endDate.toFormat('yyyy-MM-dd');

    // const expectedDaysNum = Math.floor((groupHabit.endDate - groupHabit.startDate) / (groupHabit.frequency * 1000 * 60 * 60 * 24) + 1);

    const totalDays = Math.floor(endDate.diff(startDate, 'days').days);
    const frequency = groupHabit.frequency;
    const expectedDaysNum = Math.floor(totalDays / frequency) + 1;

    const users = groupHabit.users.map(user => {
        const completedDayslength = user.dates.length;
        const completionRate = (completedDayslength / expectedDaysNum) * 100;
        const roundedCompletionRate = Math.round(completionRate * 100) / 100;

        // CURRENT STREAK
        let currStreak = 0;
        if (completedDayslength > 0) {
            currStreak = 1;
            // const lastCompletedDate = new Date(user.dates[completedDayslength - 1]).setHours(0, 0, 0, 0);
            const lastCompletedDate = user.dates[completedDayslength - 1];
            const lastCompletedDateObj = DateTime.fromFormat(lastCompletedDate, 'yyyy-MM-dd', {zone: "Asia/Kolkata"}).setZone('Asia/Kolkata').startOf('day');

            const dateDiff = Math.floor(todayDate.diff(lastCompletedDate, 'days').days);

            // if ((todayDate - lastCompletedDate) / (1000 * 60 * 60 * 24) <= frequency) {
            //     for (let i = completedDayslength - 1; i > 0; i--) {
            //         const consecutiveDatesDifference = (new Date(user.dates[i]).setHours(0, 0, 0, 0) - new Date(user.dates[i - 1]).setHours(0, 0, 0, 0)) / (60 * 60 * 24 * 1000);
            //         if (consecutiveDatesDifference <= frequency) {
            //             currStreak++;
            //         } else {
            //             break;
            //         }
            //     }
            // } else {
            //     currStreak = 0;
            // }

            
            if (dateDiff <= frequency) {
                for (let i = completedDayslength - 1; i > 0; i--) {
                    const currentCompletedDate = user.dates[i];
                    const currentCompletedDateObj = DateTime.fromFormat(currentCompletedDate, 'yyyy-MM-dd', {zone: "Asia/Kolkata"}).setZone("Asia/Kolkata").startOf('day');
                    const previousCompletedDate = user.dates[i - 1];
                    const previousCompletedDateObj = DateTime.fromFormat(previousCompletedDate, 'yyyy-MM-dd', {zone: "Asia/Kolkata"}).setZone("Asia/Kolkata").startOf('day');

                    const consecutiveDatesDifference = Math.floor(currentCompletedDateObj.diff(previousCompletedDateObj, 'days').days);

                    if (consecutiveDatesDifference <= frequency) {
                        currStreak++;
                    } else {
                        break;
                    }
                }
            } else {
                currStreak = 0;
            }
        }

        // LONGEST STREAK
        let longestStreak = 0;
        let currentStreak = 0;

        if (completedDayslength > 0) {
            currentStreak = 1;
            longestStreak = 1;

            for (let i = 0; i < completedDayslength - 1; i++) {
                // const currentDate = new Date(user.dates[i]).setHours(0, 0, 0, 0);
                // const nextDate = new Date(user.dates[i + 1]).setHours(0, 0, 0, 0);
                // const diff = (nextDate - currentDate) / (1000 * 60 * 60 * 24);

                const currentDate = user.dates[i];
                const currentDateObj = DateTime.fromFormat(currentDate, 'yyyy-MM-dd', {zone: "Asia/Kolkata"}).setZone("Asia/Kolkata").startOf('day');

                const nextDate = user.dates[i + 1];
                const nextDateObj = DateTime.fromFormat(nextDate, 'yyyy-MM-dd', {zone: "Asia/Kolkata"}).setZone("Asia/Kolkata").startOf('day');

                const diff = Math.floor(nextDateObj.diff(currentDateObj, 'days').days);

                if (diff <= frequency) {
                    currentStreak++;
                } else {
                    currentStreak = 1;
                }

                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }
            }
        }

        return {
            name: user.user.fullName,
            email: user.user.email,
            username: user.user.username,
            fullName: user.user.fullName,
            profileImage: user.user.profileImage || "",
            user: user.user._id,
            completionRate: roundedCompletionRate,
            currentStreak: currStreak,
            longestStreak,
            completedDays: user.dates,
            completedDayslength
        };
    });

    if (!users || users.length === 0) {
        throw new ApiError(400, "No users found in the group.");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            {
                group: {
                    _id: group._id,
                    groupName: group.groupName,
                    groupDesc: group.groupDesc,
                    admin: group.admin
                },
                groupHabit: {
                    _id: groupHabit._id,
                    habitName: groupHabit.habitName,
                    habitDesc: groupHabit.habitDesc,
                    habitCategory: groupHabit.habitCategory,
                    startDate: groupHabit.startDate,
                    endDate: groupHabit.endDate,
                    frequency: groupHabit.frequency,
                    status: groupHabit.status
                },
                users,
                expectedDaysNum
            },
            "Group habit completion fetched successfully."
        )
    );
});


// Route 14: Get all users with query:
const getUsers = asyncHandler(async (req, res) => {
    const { name } = req.query;
    const userId = req.user?._id;

    // console.log(name);

    if (!name) {
        throw new ApiError(400, "Username is required.");
    }

    const user = await User.findById(userId);
    if(!user.isEmailVerified){
        throw new ApiError(401, "Please verify your email first.");
    }
    

    // get the users matching the username:
    const users = await User.find({
        fullName: {
            $regex: name,
            $options: "i"
        },
        _id: { $ne: req.user?._id } // Exclude the current user
    }).limit(5).select("username fullName email profileImage");


    if (!users) {
        throw new ApiError(400, "No users found.");
    }

    res.status(200).json(
        new ApiResponse(200, users, "Users fetched successfully.")
    );
})

export {
    getGroups,
    createGroup,
    deleteGroup,
    inviteUser,
    updateGroup,
    removeUser,
    leaveGroup,
    expireGroup,
    getTodayHabits,
    updateHabitCompletion,
    getUsersDetails,
    getInvitations,
    acceptDeclineInvitation,
    getUsers
}

