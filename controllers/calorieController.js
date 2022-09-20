///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Imports
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const Day = require('../models/Day');
const jwt = require('jsonwebtoken');
const User = require('../models/Users')
const Food = require('../models/Food');
const fetch = require('node-fetch');


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Error handling
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { day: ''};

    if (err.code === 11000) {
        errors.day = 'That day has already been created!'
        return errors;
    } 

    console.log('the errors:', errors);

    return errors;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Route controllers
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// /days GET
const getDays = (req, res) => {        
    try {
        res.render('days', {pageTitle: "Days"});
        res.status(200);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err });
    }
}


// /days POST
const postDays = async (req, res) => {
    const token = req.headers.cookie.split('=')[1];
    const decodedToken = jwt.decode(token);
    console.log('days post decoded token: ', req.body.dayName.split(' ')[1])
    try{
        const day = await Day.create({userId: decodedToken.id, dayId: req.body.dayName.split(' ')[1] + decodedToken.id, dayName: req.body.dayName });
        day.save()
        .then((result) => 
            res.status(200))
        .catch((err)=>{
            const errors = handleErrors(err);
            res.status(422).json({ errors });
            console.log(err)
        })
        return new Promise(async (resolve, reject) => {
            try {
                await User.findByIdAndUpdate(
                    { _id: decodedToken.id },
                    { $push: { days: day } })
                resolve(day); 
            } catch (error) {
                const errors = handleErrors(err);
                res.status(422).json({ errors });
                console.log(err);
                reject('Day could not be added');
            }
        })
    } catch (error){
        const errors = handleErrors(error);
        res.status(422).json({ errors });
        console.log(error)
    }
    
}


// /daysList GET
const getDaysList = (req, res) => {
    const token = req.headers.cookie.split('=')[1];
    const decodedToken = jwt.decode(token);
    User.findById({_id: decodedToken.id})
        .then((result) => {
            res.json({days: result.days})
        })
        .catch((err) => {
            console.log(err)
        })
}


// /entry/:id GET
const getEntryList = (req, res) => {
    const entryId = req.params.id;
    console.log('entryId = user _id for this array of days ', entryId)
    Day.findByUserId(entryId)
        .then((result) => {
            let title = result.dayName.charAt(0).toUpperCase() + result.dayName.slice(1);
            console.log('result after finding day for entry/:id: ', result)
            res.render('entry', {pageTitle: `Day ${result.dayName.split(' ')[1]} Entry`, dayNum: title, foodList: result.foods});
            // res.json({results: result})
        })
        .catch((err) => {
            console.log(err)
        })
}


// /food GET
const getFood = (req, res) => {    
    try {
        res.render('food', {pageTitle: "Add Food"});
        res.status(200);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err });
    }
}


// /calorie POST
const postCalorie =  async (req, res) => {
    const query = req.body.query;
    const entryId = req.body.id;
    const userDayNewId = req.body.userDayNewId;
    console.log('this should be the new -id for each food: ', userDayNewId);
    let calories = 0;
    let root = "https://api.calorieninjas.com/v1/nutrition?query=";
    let url = root + query;
    try {
        const res = await fetch(url, {
            method: 'GET',                
            headers: { 
                'X-Api-Key': `${process.env.CALORIE_KEY}`
            }
        });
        const data = await res.json();
        calories = data.items[0].calories;
        let obj;
        let newId = 1;
        Day.findByUserId(entryId)
        .then((result) => {
            obj = result._id.toString()
            let arr = [];
            console.log('data recieved when added food: ', result.foods)
        })
        .catch((err) => {
            console.log(err)
        })
        try{
            const food = await Food.create({userDayId: entryId +'-' + userDayNewId, foodName: data.items[0].name, calorieAmount: data.items[0].calories }); //CHANGE BACK!!!!!!
            food.save()
            .then((result) => {
                console.log('food result: ', result);
                // res.status(200)
            })
            .catch((err)=>{
                console.log(err)
            })
            return new Promise(async (resolve, reject) => {
                try {
                    await Day.findByIdAndUpdate(
                        { _id: obj }, 
                        { $push: { foods: food } })
                    resolve(food); 
                } catch (error) {
                    // const errors = handleErrors(error);
                    // res.status(422).json({ errors });
                    console.log(error);
                    reject('Food could not be added');
                }
            })
        } catch (error){
            // const errors = handleErrors(error);
            // res.status(422).json({ errors });
            console.log(error)
        }
    }
    catch (err){
        console.error(err);
    }
    res.send({'calories': calories})
}
  

const postFoodId = (req, res) => {
    const entryId = req.body.id;
    console.log('the entryid for food added: ', entryId)
    let newId = 0;
    Day.findByUserId(entryId)
    .then((result) => {
        obj = result._id.toString()
        let arr = [];
        console.log('data recieved when added food: ', result.foods)
        if(result.foods.length > 0){
            for (let i = 0; i < result.foods.length; i++) {
                arr.push(result.foods[i].userDayId.split('-')[1]);
                console.log('current ids: ', result.foods[i].userDayId.split('-')[1])
            }
            newId = Math.max(...arr) + 1;
        } else {
            console.log('i ran instead ', newId)
            newId = 1;
        }
        console.log('newId: ', newId)
        res.send({'newId': newId})
    })
    .catch((err) => {
        console.log(err)
    })
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Exports
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = { getDays, postDays, getDaysList, getFood, postCalorie, getEntryList, postFoodId };
