const express = require('express');
const router = express.Router();

const coachAthleteController = require('../controllers/coachAthleteController');

router.post('/', coachAthleteController.createCoachAthlete);
router.get('/', coachAthleteController.getCoachAthlete);
router.get('/:id', coachAthleteController.getCoachAthleteById);
router.put('/:id', coachAthleteController.updateCoachAthlete);
router.delete('/:id', coachAthleteController.deleteCoachAthlete);

module.exports = router;