import { Router } from "express";
import { createGroup, getGroups, deleteGroup, inviteUser, updateGroup, removeUser, leaveGroup, expireGroup, updateHabitCompletion, getTodayHabits, getUsersDetails, getInvitations, acceptDeclineInvitation, getUsers, validateNewGroup, validateUpdateGroup } from "../controllers/group.controller.js";


const router = Router();

router.route('/getgroups').get(getGroups);
router.route('/creategroup').post(validateNewGroup, createGroup);
router.route('/deletegroup').delete(deleteGroup);
router.route('/inviteuser').post(inviteUser);
router.route('/updategroup').patch(validateUpdateGroup, updateGroup);
router.route('/removeuser').patch(removeUser);
router.route('/leavegroup').patch(leaveGroup);
router.route('/expiregroup').patch(expireGroup);
router.route('/updatehabitCompletion').patch(updateHabitCompletion);
router.route('/gettodayhabits').get(getTodayHabits);
router.route('/getusers').get(getUsersDetails);
router.route('/getInvites').get(getInvitations);
router.route('/acceptDeclineInvite').patch(acceptDeclineInvitation);
router.route('/getusernames').get(getUsers);

export default router;