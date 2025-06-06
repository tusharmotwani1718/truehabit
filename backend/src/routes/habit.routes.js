import { Router } from "express";
import { validateNewHabit, addNewHabit, getHabits, deleteHabit, updateHabit, validateUpdateHabit, updateHabitCompletion, expireHabits, fetchHabitDetails, fetchCompletedDates, batchFetchHabitDetails, countHabitByStatus, countHabitsbyTimePeriod } from "../controllers/habit.contoller.js";

const router = Router();

router.route('/gethabits/:habitType').get(getHabits);
router.route('/count').get(countHabitByStatus);
router.route('/countbytime/:timePeriod').get(countHabitsbyTimePeriod);
router.route('/fetchhabitdetails/:habitId').get(fetchHabitDetails)
router.route('/gethabitcompletedDays').get(fetchCompletedDates);
router.route('/batchfetchhabitdetails').post(batchFetchHabitDetails);
router.route('/addhabit').post(validateNewHabit, addNewHabit);
router.route('/deletehabit/:habitId').delete(deleteHabit);
router.route('/updatehabit').patch(validateUpdateHabit, updateHabit)
router.route('/updatehabitstatus').patch(updateHabitCompletion);
router.route('/expirehabits').post(expireHabits)

export default router;