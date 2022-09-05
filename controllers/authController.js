///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Imports
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const User = require('../models/Users');
const jwt = require('jsonwebtoken');
require('dotenv').config() // to use env file to hide secret


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Error handling
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { username: '', password: '', email: '' };

    if (err.message === 'Incorrect email') {
        errors.email = 'That email is not registered'
    }

    if (err.message === 'Invalid password') {
        errors.email = 'That password is incorrect'
    }

    //duplicate error codename
    if (err.code === 11000 && err.message.includes('username')) {
        errors.username = 'That username is already in use'
        return errors;
    } else if (err.code === 11000 && err.message.includes('email')) {
        errors.username = 'That email is already in use'
        return errors;
    }

    console.log(err);

    //validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }
    return errors;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Web tokens
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const maxAge = 3 * 24 * 60 * 60 // 3 days in seconds
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: maxAge
    });
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Route controllers
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// signup GET
const getSignup = (req, res) => {    
    try {
        res.render('signup', {pageTitle: "Sign Up"});
        res.status(200);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err });
    }
}

// signup POST
const addUser = async (req, res) => {
    const { email, username, password } = req.body;

    try {
        const user = await User.create({ email, username, password });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000}) // cookie lasts 3 days
        res.status(201).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(422).json({ errors });
    }
}

// login GET
const getLogin = (req, res) => {
    try {
        res.render('login', {pageTitle: "Log In"});
        res.status(200);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err });
    }
    
}

// login POST
const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.login(username, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000}) // cookie lasts 3 days
        res.status(201).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(422).json({ errors });
    }
}

const logoutUser = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Exports
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = { getSignup, addUser, getLogin, loginUser, logoutUser }
