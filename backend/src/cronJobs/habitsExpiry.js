import cron from 'node-cron';
import { Habit } from '../models/habit.model.js'; // Adjust path
import { GroupHabit } from '../models/grouphabit.model.js';

// Schedule job to run at 00:05 AM daily
cron.schedule("5 0 * * *", async () => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);

    try {
        // expire habits:
        const result = await Habit.updateMany(
            { endDate: { $lt: date }, status: { $ne: "expired" } },
            { $set: { status: "expired" } }
        );


        // // expire groups:
        // const groups = await GroupHabit.updateMany(
        //     { endDate: { $lt: date }, status: { $ne: "expired" } },
        //     { $set: { status: "expired" } }
        // )


        console.log(`[Habit Expiry] ${result.modifiedCount} habits marked as expired.`);
        // console.log(`[Group Expiry] ${groups.modifiedCount} groups marked as expired.`);
    } catch (error) {
        console.error("Error in habit expiry job:", error);
    }
});

console.log("[Habit Expiry Cron] Scheduled successfully.");
