import { asyncHandler } from "../utils/asyncHandler.js";
import { body, validationResult } from 'express-validator'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Habit } from "../models/habit.model.js";
import dotenv from 'dotenv';
import { User } from "../models/user.model.js";
import arcjetService from "../utils/arcjet.js";
import mongoose from "mongoose";
import { compareDatesWithoutTime } from "../../../shared/functions/CompareDates.js";


dotenv.config();


// In this controller all the routes would be requiring authentication on login (Verify JWT) as you can perform no action on your habits until you are logged in.
const validateNewHabit = [
    body('habitName', 'Habit Name should be atleast of 3 characters').exists().isLength({ min: 3 }).notEmpty(),
    body('habitDesc', 'Habit Description should be atleast of 5 characters').isLength({ min: 5 }).notEmpty(),
];

const validateUpdateHabit = [
    body('hName').optional().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long.'),
    body('hDesc').optional().isLength({ min: 5 }).withMessage('Description must be at least 5 characters long.'),
    body('startDate').optional().isISO8601().withMessage('Invalid start date format.')
]


// Route 1: Fetch habits:
const getHabits = async (req, res) => {
    // arcjet Rate Limit function:
    const decision = await arcjetService.rateLimit({ refillRate: 5, interval: "5m", capacity: 5 }).protect(req, { email: req.user?.email })
    // console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
        if (decision.reason.isEmail()) {
            throw new ApiError(
                400,
                "Invalid or Disposable emails not allowed."
            )
        } else {
            throw new ApiError(
                400,
                "Too many requests. Please try after some time..."
            )
        }
    }

    const { habitType } = req.params;
    // console.log(habitType)
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    // Base match conditions
    const matchConditions = {
        userID: req.user?._id,
        status: habitType === "active" || habitType === "expired" ? habitType : "active"
    };

    // Additional conditions for "today" habits
    if (habitType === "today") {
        // Create date range for the entire day
        const startOfDay = new Date(todayDate);
        const endOfDay = new Date(todayDate);
        endOfDay.setHours(23, 59, 59, 999);

        matchConditions.$and = [
            { startDate: { $lte: endOfDay } },  // Habit started before end of today
            { endDate: { $gte: startOfDay } }   // Habit ends after start of today
        ];
    }

    // First fetch all habits that match the basic conditions
    let habits = await Habit.aggregate([
        {
            $match: matchConditions
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    // For "today" habits, further filter based on frequency and last completed date
    if (habitType === "today") {
        // console.log(habits)
        habits = habits.filter(habit => {

            if (!habit.completedDays || habit.completedDays.length === 0) {
                // If never completed, it should be shown
                return true;
            }

            // If completed today, it should be shown
            if (compareDatesWithoutTime(habit.completedDays[habit.completedDays.length - 1], todayDate)) {
                return true;
            }

            const lastCompletedDate = new Date(habit.completedDays[habit.completedDays.length - 1]);
            lastCompletedDate.setHours(0, 0, 0, 0);

            const daysSinceLastCompletion = Math.floor((todayDate - lastCompletedDate) / (1000 * 60 * 60 * 24));

            // Show habit if days since last completion >= frequency
            return daysSinceLastCompletion >= habit.frequency;
        });
    }

    return res.status(200).json(
        new ApiResponse(200, habits, "Habits fetched successfully!")
    );


}

// Route 2: Adding a new habit
const addNewHabit = asyncHandler(async (req, res) => {

    // arcjet Rate Limit function:
    const userId = req.headers["x-forwarded-for"] || req.connection.remoteAddress; // Fetch the user's IP address
    const decision = await arcjetService.rateLimit({
        refillRate: 10,
        interval: 120,
        capacity: 10
    }).protect(req, { userId, email: req.user?.email, requested: 1 }); // Deduct 1 token from the bucket
    if (decision.isDenied()) {
        throw new ApiError(
            400,
            "Too Many Requests...Please try again after some time"
        )
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(400, errors)
    }



    const { habitName, habitDesc, habitCategory, startDate, endDate, frequency, status } = req.body;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to start of the day

    if (startDate && !endDate) {
        throw new ApiError(400, "End date is required.");
    }

    const startDateObj = new Date(startDate).setHours(0, 0, 0, 0); // Set time to start of the day
    const endDateObj = new Date(endDate).setHours(0, 0, 0, 0); // Set time to start of the day

    // cannot add a habit in the past:
    if (startDateObj < currentDate || endDateObj < currentDate) {
        throw new ApiError(400, "Invalid Dates.")
    }

    if (startDateObj >= endDateObj) {
        throw new ApiError(400, "End date should be greater than start date.");
    }



    // add habit in habits model:
    const habit = await Habit.create({
        habitName,
        habitDesc,
        habitCategory,
        startDate,
        endDate,
        frequency,
        userID: req.user?._id, // pass the user id,
        status

    })

    if (!habit) {
        throw new ApiError(400, "An error occurred while adding the habit.")
    }

    const getHabit = await Habit.findById(habit._id).select('-password -refreshToken -userID');
    if (!getHabit) {
        throw new ApiError(400, "An error occurred while adding the habit.")
    }

    // add habit id to habitCollection array in users document:
    const addHabittoUser = await User.findByIdAndUpdate(
        req.user?._id,
        { $push: { habitCollection: habit._id } },
        { new: true }
    )


    if (!addHabittoUser) {
        throw new ApiError(400, "An error occurred while adding the habit.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                201,
                getHabit,
                "Habit added successfully"
            )
        )


})

// Route 3: Delete a habit:
const deleteHabit = asyncHandler(async (req, res) => {

    // arcjet Rate Limit function:
    const userId = req.headers["x-forwarded-for"] || req.connection.remoteAddress; // Fetch the user's IP address
    const decision = await arcjetService.rateLimit({
        refillRate: 10,
        interval: 120,
        capacity: 10
    }).protect(req, { userId, email : req.user?.email, requested: 1 }); // Deduct 1 token from the bucket
    if (decision.isDenied()) {
        throw new ApiError(
            400,
            "Too Many Requests...Please try again after some time"
        )
    }

    const { habitId } = req.params;

    if (!habitId) {
        throw new ApiError(400, "Habit ID is required.");
    }

    // Check if the user exists and retrieve their habitCollection
    const user = await User.findById(req.user?._id).select('habitCollection');

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    // If the user has no habits, we can return an error here
    if (user.habitCollection.length === 0) {
        throw new ApiError(400, "No habits to delete.");
    }

    // Check if the habitId exists in the user's habitCollection
    if (!user.habitCollection.includes(habitId)) {
        throw new ApiError(403, "Invalid habit id.");
    }

    // Delete the habit from the 'habits' model
    const deleteHabitfromHabits = await Habit.findByIdAndDelete(habitId);
    if (!deleteHabitfromHabits) {
        throw new ApiError(400, "Error occurred while deleting the habit.");
    }

    // Delete the habitId from the 'habitCollection' array in 'users' model
    const deleteHabitfromUsers = await User.findByIdAndUpdate(
        req.user?._id,
        { $pull: { habitCollection: habitId } },
        { new: true }
    );

    if (!deleteHabitfromUsers) {
        throw new ApiError(400, "Error occurred while deleting the habit.");
    }

    // Return a success response
    res.status(200).json(new ApiResponse(200, [], "Habit deleted successfully."));


});

// Route 4: Update habit details:
const updateHabit = asyncHandler(async (req, res) => {

    // arcjet Rate Limit function:
    const userId = req.headers["x-forwarded-for"] || req.connection.remoteAddress; // Fetch the user's IP address
    const decision = await arcjetService.rateLimit({
        refillRate: 10,
        interval: 120,
        capacity: 10
    }).protect(req, { userId, requested: 1 }); // Deduct 1 token from the bucket
    if (decision.isDenied()) {
        throw new ApiError(
            400,
            "Too Many Requests...Please try again after some time"
        )
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }



    const { habitId, hName, hDesc, category, startDate, endDate } = req.body;

    // check for habit id:
    if (!habitId) {
        throw new ApiError(400, "Invalid Habit Id.");
    }

    // check if the habit id belongs to logged in user:
    const user = await User.findById(req.user?._id).select('habitCollection');
    if (!user.habitCollection.includes(habitId)) {
        throw new ApiError(400, "You are not allowed to update this habit details.")
    }

    // throw error if there is no field to update:
    if (!hName && !hDesc && !category && !startDate && !endDate) {
        throw new ApiError(400, "Required Fields are missing.");
    }

    // get the habit:
    const habit = await Habit.findById(habitId);


    if (hName) habit.habitName = hName;
    if (hDesc) habit.habitDesc = hDesc;
    if (category) habit.habitCategory = category;
    if (startDate) habit.startDate = startDate;
    if (endDate) habit.endDate = endDate;

    await habit.save({ validateBeforeSave: false });

    res
        .status(200)
        .json(
            new ApiResponse(201, habit, "Habit details updated successfully.")
        )



})

// Route 5: Update habit completion status:
const updateHabitCompletion = asyncHandler(async (req, res) => {



    // currentDate:
    const currentDate = new Date();
    const { habitId, completionDate } = req.body;
    const completionDateObj = new Date(completionDate);


    if (!habitId || !completionDate) {
        throw new ApiError(400, "Required fields are missing.");
    }

    // check whether the current date matches with completion date:
    if (!compareDatesWithoutTime(currentDate, completionDateObj)) {
        throw new ApiError(400, "Marking completion for future/past date is not allowed.");
    }


    // Verify if the user owns the habit
    const user = await User.findById(req.user?._id).select("habitCollection");
    if (!user.habitCollection.includes(habitId)) {
        throw new ApiError(400, "You are not allowed to update this habit.");
    }

    const habit = await Habit.findById(habitId);
    if (!habit) {
        throw new ApiError(400, "Habit not found.");
    }



    const frequency = habit.frequency;



    // Check if the completion date is within the valid range:
    // setting this time format as to compare the dates with same time:
    const normalizedCompletionDate = completionDateObj.setHours(0, 0, 0, 0);
    const startDate = new Date(habit.startDate).setHours(0, 0, 0, 0);
    const endDate = new Date(habit.endDate).setHours(0, 0, 0, 0);

    if (normalizedCompletionDate < startDate || normalizedCompletionDate > endDate) {
        throw new ApiError(400, "Date must be between the start and end dates.");
    }

    // Ensure the maximum possible dates are not exceeded
    // maxDates = [(endDate - startDate) / ferquency] + 1
    const maxDates = Math.floor((endDate - startDate) / (frequency * 1000 * 60 * 60 * 24) + 1);
    if (habit.completedDays.length >= maxDates) {
        throw new ApiError(400, "Maximum possible completion dates have been reached.");
    }



    // ensure that the date is in the valid range as per the last date added:
    if (habit.completedDays.length > 0) {
        const lastDate = habit.completedDays[habit.completedDays.length - 1];
        const newCompletionDate = new Date(completionDate).setHours(0, 0, 0, 0);
        const newLastDate = new Date(lastDate).setHours(0, 0, 0, 0);

        // console.log(newCompletionDate);
        // console.log(newLastDate)


        const dateDifference = newCompletionDate - newLastDate; // return difference in milliseconds

        const differenceInDays = Math.floor(dateDifference / (1000 * 60 * 60 * 24)); // convert milliseconds to days
        // console.log(differenceInDays)
        if (differenceInDays != frequency && !(differenceInDays > frequency)) {
            throw new ApiError(400, "Invalid completion date as per last date of the habit.")
        }

    }

    // Add the completion date:
    habit.completedDays.push(completionDate);
    await habit.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(201, habit.completedDays, "Habit status updated successfully.")
    );
});

// Route 6: Expire Habits by current date:
const expireHabits = asyncHandler(async (req, res) => {


    const date = new Date();
    date.setHours(23, 59, 59, 999); // set time at end of the day.


    const expire = await Habit.updateMany(
        { endDate: { $lt: date } }, // Filter: Habits with endDate < current date
        { $set: { status: "expired" } }  // Update: Set status field to "expired"
    );

    if (expire.matchedCount === 0) {
        throw new ApiError(500, "No habits to expire.");
    }



    res.status(200).json(
        new ApiResponse(201, `${expire.modifiedCount} habits have been marked as completed.`)
    )

})

// Route 7: Fetch a specific habit:
const fetchHabitDetails = asyncHandler(async (req, res) => {
    const { habitId } = req.params;
    const habit = await Habit.findById(habitId);

    // console.log(req.params);



    // check if habit exists:
    if (!habit) {
        throw new ApiError(400, "Habit not found.");
    }

    // check if the habit belongs to user:
    const user = await User.findById(req.user?._id);
    if (!user.habitCollection.includes(habitId)) {
        throw new ApiError(400, "You are not allowed to access this habit.");
    }

    // calculate the streak:

    // 1. current streak:
    let currStreak = 0;
    const todayDate = new Date().setHours(0, 0, 0, 0); // set time to start of the day
    const frequency = habit.frequency; // in days

    if (habit.completedDays.length > 0) {
        currStreak = 1;
        const lastCompletedDate = new Date(habit.completedDays[habit.completedDays.length - 1]).setHours(0, 0, 0, 0); // set time to start of the day

        if ((todayDate - lastCompletedDate) / (1000 * 60 * 60 * 24) <= frequency) {
            for (let i = habit.completedDays.length - 1; i > 0; i--) {
                const consecutiveDatesDifference = (new Date(habit.completedDays[i]).setHours(0, 0, 0, 0) - new Date(habit.completedDays[i - 1]).setHours(0, 0, 0, 0)) / (60 * 60 * 24 * 1000);
                if (consecutiveDatesDifference <= frequency) {
                    currStreak++;
                }
                else {
                    break;
                }
            }
        }
        else {
            currStreak = 0;
        }

    }


    // 2. longest streak:
    let longestStreak = 0;
    let currentStreak = 0;

    if (habit.completedDays.length > 0) {
        currentStreak = 1;
        longestStreak = 1;

        for (let i = 0; i < habit.completedDays.length - 1; i++) {
            const currentDate = new Date(habit.completedDays[i]).setHours(0, 0, 0, 0);
            const nextDate = new Date(habit.completedDays[i + 1]).setHours(0, 0, 0, 0);
            const consecutiveDatesDifference = (nextDate - currentDate) / (60 * 60 * 24 * 1000);

            if (consecutiveDatesDifference <= frequency) {
                currentStreak++;
            } else {
                currentStreak = 1; // reset streak
            }

            // ✅ Update the longest streak inside the loop
            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
            }
        }
    }


    // number of expected and completed days:
    const expectedDaysNum = Math.floor((habit.endDate - habit.startDate) / (habit.frequency * 1000 * 60 * 60 * 24) + 1);
    const completedDaysNum = habit.completedDays.length;

    // number of days left:
    const daysLeft = Math.floor((habit.endDate - todayDate) / (1000 * 60 * 60 * 24)) || 0;






    res.status(200).json(
        new ApiResponse(201, {
            habit,
            currStreak,
            longestStreak,
            expectedDaysNum,
            completedDaysNum,
            daysLeft
        }, "Habit details fetched successfully")
    )

})

// Route 8: Fetch completed dates of a habit:
const fetchCompletedDates = asyncHandler(async (req, res) => {
    const { habitID } = req.body;

    if (!habitID) {
        throw new ApiError("Habit id is required.")
    }


    // check if the habit belongs to user:
    const user = await User.findById(req.user?._id).select("habitCollection");
    if (!user.habitCollection.includes(habitID)) {
        throw new ApiError(400, "Invalid Habit ID");
    }

    const habit = await Habit.findById(habitID).select("completedDays");
    if (!habit) {
        throw new ApiError(400, "Habit not found.");
    }


    // send array of completed days:
    res.status(200).json(
        new ApiResponse(201, habit, "Completed days fetched successfully")
    );

})


// Route 9: Batch fetching of habits details:
const batchFetchHabitDetails = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) {
        throw new ApiError(400, "Habit ids are required.");
    }

    // console.log(ids);

    // Convert string IDs to ObjectId
    const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));


    // const habitIds = ids.split(','); // Convert to array
    const habits = await Habit.find({ _id: { $in: objectIds } }).select("completedDays"); // Fetch multiple habits

    //    console.log(habits)

    if (!habits.length) {
        throw new ApiError(400, "No habits found.");
    }

    // check if user is allowed to access these habits:
    const user = await User.findById(req.user?._id).select("habitCollection");
    const allowedHabits = habits.filter(habit => user.habitCollection.includes(habit._id));

    if (!allowedHabits) {
        throw new ApiError(400, "You are not allowed to access these habits.");
    }

    return res.status(200).json(
        new ApiResponse(201, allowedHabits, "Habits details fetched successfully.")
    )
})


// Route 10: Get habit count of each habit type:
const countHabitByStatus = asyncHandler(async (req, res) => {
    const count = await Habit.aggregate([
        {
            $match: {
                userID: req.user?._id
            }
        },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ])

    res.status(200).json(
        new ApiResponse(201, count, "Habit count fetched successfully.")
    )

})


// Route 11: Get habit count for each habit by time-period and completion rate:
// This function will return the count of habits created in the last week/month and their completion rate for the same time period.
// It will also return the completion rate for the last week/month for comparison.
const countHabitsbyTimePeriod = asyncHandler(async (req, res) => {
    let { timePeriod } = req.params;
    const today = new Date();

    const currYear = today.getFullYear();
    const currMonth = today.getMonth(); // 0-based, so January = 0

    // Start of current month
    const startingofMonth = new Date(currYear, currMonth, 1);

    // End of current month
    const endofMonth = new Date(currYear, currMonth + 1, 0); // Day 0 of next month

    // Start of current week (Sunday)
    const dayofWeek = today.getDay(); // Sunday = 0
    const startingofWeek = new Date(today);
    startingofWeek.setDate(today.getDate() - dayofWeek);

    // End of current week
    const endofWeek = new Date(startingofWeek);
    endofWeek.setDate(startingofWeek.getDate() + 6); // Saturday

    // Start of previous month
    const startOfLastMonth = new Date(currYear, currMonth - 1, 1);

    // End of previous month
    const endOfLastMonth = new Date(currYear, currMonth, 0); // Day 0 of current month

    // Start of previous week (7 days before start of this week)
    const startOfLastWeek = new Date(startingofWeek);
    startOfLastWeek.setDate(startingofWeek.getDate() - 7);

    // End of previous week (1 day before start of current week)
    const endOfLastWeek = new Date(startingofWeek);
    endOfLastWeek.setDate(startingofWeek.getDate() - 1);







    // console.log(endofWeek, endofMonth);

    if (!timePeriod) {
        timePeriod = "thisWeek";
    }

    if (timePeriod != "thisWeek" && timePeriod != "thisMonth") {
        throw new ApiError(400, "Invalid time period.");
    }

    const getStartOfDay = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    // const periodStartDate = timePeriod === "thisWeek"
    //     ? getStartOfDay(pastWeek)
    //     : getStartOfDay(pastMonth);

    const periodStartDate = timePeriod === "thisWeek"
        ? getStartOfDay(startingofWeek)
        : getStartOfDay(startingofMonth);


    const periodEndDate = timePeriod === "thisWeek"
        ? getStartOfDay(endofWeek)
        : getStartOfDay(endofMonth);

    const lastPeriodStartDate = timePeriod === "thisWeek"
        ? getStartOfDay(startOfLastWeek)
        : getStartOfDay(startOfLastMonth);

    const lastPeriodEndDate = timePeriod === "thisWeek"
        ? getStartOfDay(endOfLastWeek)
        : getStartOfDay(endOfLastMonth);



    const dashboardMatchConditions = {
        userID: req.user?._id,
    };

    const habitsWithCount = await Habit.aggregate([
        {
            $match: dashboardMatchConditions
        },
        {
            $match: {
                createdAt: {
                    $gte: periodStartDate
                }
            }
        },
        {
            $facet: {
                data: [{ $sort: { createdAt: -1 } }], // return the documents
                count: [{ $count: "habitsCount" }] // count them
            }
        }
    ])


    const searchMatchConditions = {
        startDate: {
            $lte: today
        },
        endDate: {
            $gte: periodStartDate
        }
    };


    const comparisonMatchConditions = {
        startDate: { $lte: lastPeriodEndDate },
        endDate: { $gte: lastPeriodStartDate }
    };



    // combinedMatchConditions is for current time period to get data and combinedComparisonConditions is for last time period conditions to get data:
    const combinedMatchConditions = {
        ...dashboardMatchConditions,
        ...searchMatchConditions
    }


    const combinedComparisonConditions = {
        ...dashboardMatchConditions,
        ...comparisonMatchConditions
    }

    const completionRateHabits = await Habit.aggregate([
        {
            $match: combinedMatchConditions
        }
    ])



    const comparisonRateHabits = await Habit.aggregate([
        {
            $match: combinedComparisonConditions
        }
    ])

    if (!completionRateHabits || !comparisonRateHabits) {
        throw new ApiError(400, "No habits found.");
    }

    // for current habits:
    let completionRate = 0;
    let avgCompletionRate = 0;


    completionRateHabits.map((habit) => {
        const completedDaysNum = habit.completedDays.length;
        let completedDaysCount = 0;
        if (completedDaysNum > 0) {



            for (let i = 0; i < completedDaysNum; i++) {
                const currentDate = new Date(habit.completedDays[i]).setHours(0, 0, 0, 0);


                // if the date is less than the start of the period, skip it
                if (currentDate < getStartOfDay(periodStartDate)) {
                    continue;
                }

                // if the date is greater than the end of the period, no need to check further
                if (currentDate > getStartOfDay(periodEndDate)) {
                    break;
                }

                // otherwise add it to the count
                completedDaysCount++;
            }

            let startDate;
            if (getStartOfDay(new Date(habit.startDate)) < getStartOfDay(periodStartDate)) {
                startDate = getStartOfDay(periodStartDate);
            }

            else {
                startDate = getStartOfDay(habit.startDate)
            }

            const frequency = habit.frequency;
            const expectedDays = Math.round((today - startDate) / (frequency * 1000 * 60 * 60 * 24) + 1);
            // console.log(expectedDays,completedDaysCount);

            // completion rate for each habit:
            completionRate = (completedDaysCount / expectedDays) * 100;
            // console.log(completionRate);

        }

        else {
            completionRate = 0;
        }



        avgCompletionRate += completionRate;
    })

    avgCompletionRate = completionRateHabits.length > 0 ? avgCompletionRate / completionRateHabits.length : 0;
    avgCompletionRate = Math.round(avgCompletionRate * 100) / 100; // limiting to 2 decimal points.



    // for last time period:
    let lastCompletionRate = 0;
    let lastAvgCompletionRate = 0;


    // console.log(comparisonRateHabits.length)
    comparisonRateHabits.map((habit) => {
        const completedDaysNum = habit.completedDays.length;
        let completedDaysCount = 0;
        if (completedDaysNum > 0) {

            for (let i = 0; i < completedDaysNum; i++) {
                const currentDate = new Date(habit.completedDays[i]).setHours(0, 0, 0, 0);


                // if the date is less than the start of the period, skip it
                if (currentDate < getStartOfDay(lastPeriodStartDate)) {
                    continue;
                }

                // if the date is greater than the end of the period, no need to check further
                if (currentDate > getStartOfDay(lastPeriodEndDate)) {
                    break;
                }

                // otherwise add it to the count
                completedDaysCount++;
            }

            let startDate;
            if (getStartOfDay(new Date(habit.startDate)) < getStartOfDay(lastPeriodStartDate)) {
                startDate = getStartOfDay(lastPeriodStartDate);
            }

            else {
                startDate = getStartOfDay(habit.startDate)
            }

            const frequency = habit.frequency;
            const expectedDays = Math.round((today - startDate) / (frequency * 1000 * 60 * 60 * 24) + 1);

            // completion rate for each habit:
            completionRate = (completedDaysCount / expectedDays) * 100;
            // console.log(completionRate);

        }

        else {
            completionRate = 0;
        }


        // console.log("CR: " + completionRate);

        lastAvgCompletionRate += lastCompletionRate;
    })
    // console.log(comparisonRateHabits)



    lastAvgCompletionRate = comparisonRateHabits.length > 0 ? lastAvgCompletionRate / comparisonRateHabits.length : 0;
    lastAvgCompletionRate = Math.round(lastAvgCompletionRate * 100) / 100; // limiting to 2 decimal points.
    // console.log(lastAvgCompletionRate);

    res.status(200).json(
        new ApiResponse(201, {
            habitsWithCount,
            avgCompletionRate,
            lastAvgCompletionRate
        },
            "Data fetched successfully"
        )
    )

})





export {
    getHabits,
    addNewHabit, validateNewHabit,
    deleteHabit,
    updateHabit, validateUpdateHabit,
    updateHabitCompletion,
    expireHabits,
    fetchHabitDetails,
    fetchCompletedDates,
    batchFetchHabitDetails,
    countHabitByStatus,
    countHabitsbyTimePeriod

}