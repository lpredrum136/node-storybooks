const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('./keys');

// Load user model
require('../models/User');
const User = mongoose.model('users');

module.exports = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: '/auth/google/callback',
        proxy: true// very important to fix https vs http
    }, (accessToken, refreshToken, profile, done) => {
        console.log(`THIS IS ACCESSTOKEN: ${accessToken}`);
        console.log(`THIS IS PROFILE`);
        console.log(profile);
        const image = profile.photos[0].value;

        const newUser = {
            googleID: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            image: image 
        };

        // Check for existing user
        User.findOne({
            googleID: profile.id
        })
            .then(user => {
                if (user) {
                    // Return user if there is a user
                    done(null, user);
                } else {
                    // Create user
                    new User(newUser).save()
                                    .then(user => done(null, user));// Create and return a user
                }
            });

    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id).then(user => done(null, user));
    });
};