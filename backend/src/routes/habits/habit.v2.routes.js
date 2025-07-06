import { Router } from "express";
import { addNote, editNote, fetchNotes } from "../../controllers/habit.contoller.js";


const router = Router();

router.route('/fetchnotes').get(fetchNotes);
router.route('/addnote').post(addNote);
router.route('/editnote').patch(editNote);


export default router;