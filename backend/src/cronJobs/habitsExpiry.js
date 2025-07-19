import cron from 'node-cron';
import { Habit } from '../models/habit.model.js'; // Adjust path
import { GroupHabit } from '../models/grouphabit.model.js';
import { DateTime } from 'luxon';

// Schedule job to run at 00:05 AM daily
cron.schedule("5 0 * * *", async () => {
// cron.schedule("* * * * *", async () => {
    const today = DateTime.now().setZone("Asia/Kolkata").toFormat('yyyy-MM-dd');

    console.log("[CRON] Running Habit Expiry Check...");
    console.log("[CRON] Today's IST Date:", today);

    const habitsToExpire = await Habit.find({
        endDate: { $lt: today },
        status: { $ne: "expired" }
    });

    console.log("[CRON] Habits Expiring Today:", habitsToExpire.map(h => ({
        name: h.habitName,
        endDate: h.endDate
    })));

    const result = await Habit.updateMany(
        { endDate: { $lt: today }, status: { $ne: "expired" } },
        { $set: { status: "expired" } }
    );

    console.log(`[Habit Expiry] ${result.modifiedCount} habits marked as expired.`);
}, 
{
    timezone: "Asia/Kolkata"
});


console.log("[Habit Expiry Cron] Scheduled successfully.");
