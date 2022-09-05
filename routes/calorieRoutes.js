///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Imports
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const { Router } = require('express');
const calorieController = require('../controllers/calorieController')
const { requireAuth } = require('../middleware/authMiddleware');


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialisation
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const router = Router();


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/days', requireAuth, calorieController.getDays);

router.post('/days', calorieController.postDays);

router.get('/daysList', calorieController.getDaysList);

router.get('/entry/:id', calorieController.getEntryList);

router.get('/food', calorieController.getFood);

router.post('/calorie', calorieController.postCalorie);

router.post('/calorie', calorieController.postF);


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Exports
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;