import cron from 'node-cron';
import { Habit } from '../models/habit.model.js'; // Adjust path
import { GroupHabit } from '../models/grouphabit.model.js';
import { DateTime } from 'luxon';

// Schedule job to run at 00:05 AM daily
cron.schedule("5 0 * * *", async () => {
    // const date = new Date();
    // date.setHours(23, 59, 59, 999);

    const today = DateTime.now().setZone("Asia/Kolkata").toFormat('yyyy-MM-dd');


    try {
        // expire habits:
        const result = await Habit.updateMany(
            { endDate: { $lt: today }, status: { $ne: "expired" } },
            { $set: { status: "expired" } }
        );


        // expire groups:
        const groups = await GroupHabit.updateMany(
            { endDate: { $lt: today }, status: { $ne: "expired" } },
            { $set: { status: "expired" } }
        )


        console.log(`[Habit Expiry] ${result.modifiedCount} habits marked as expired.`);
        console.log(`[Group Expiry] ${groups.modifiedCount} groups marked as expired.`);
    } catch (error) {
        console.error("Error in habit expiry job:", error);
    }
});

console.log("[Habit Expiry Cron] Scheduled successfully.");
