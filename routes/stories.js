const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth');

// Load Story Model
require('../models/Story');
const Story = mongoose.model('stories');

// Load User model
require('../models/User');
const User = mongoose.model('users');

// Stories Index: Fetch all public stories
router.get('/', (req, res) => {
    Story.find({
        status: 'public'
    })
        .populate('user')// populate user with all the fields from the User collection, because of relationship
        .sort({date: 'desc'})
        .then(stories => {
            
            res.render('stories/index', {
                stories: stories
            });
        });
});

// Show single story
router.get('/show/:id', (req, res) => {
    Story.findOne({
        _id: req.params.id
    })
        .populate('user')// VERY IMPORTANT
        .populate('comments.commentUser')// So basically you point to wherever you save the user id relationship
        .then(story => {
            if (story.status == 'public') {
                res.render('stories/show', {
                    story: story
                });
            } else {
                if (req.user) {// There is the owner logged in
                    if (req.user.id == story.user._id) {
                        res.render('stories/show', {
                            story: story
                        });
                    } else {
                        res.redirect('/stories');
                    }
                } else {
                    res.redirect('/stories');
                }
            }
        });
});

// List stories from a specific user
router.get('/user/:userId', (req, res) => {
    Story.find({
        user: req.params.userId,
        status: 'public'
    })
        .populate('user')
        .then(stories => {
            res.render('stories/index', {
               stories: stories 
            });
        });
});

// Logged in users stories
router.get('/my', ensureAuthenticated, (req, res) => {
    Story.find({
        user: req.user.id
    })
        .populate('user')
        .then(stories => {
            res.render('stories/index', {
               stories: stories 
            });
        });
});

// Add story Form
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('stories/add');
});

// Process add stories
router.post('/', (req, res) => {
    let allowComments;

    if (req.body.allowComments) {
        allowComments = true;
    } else {
        allowComments = false;
    }

    const newStory = {
        title: req.body.title,
        body: req.body.body,
        status: req.body.status,
        allowComments: allowComments,
        user: req.user.id,
    };

    // Create story
    new Story(newStory).save()
        .then(story => {
            res.redirect(`/stories/show/${story._id}`);
        });
});

// Edit story Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Story.findOne({
        _id: req.params.id
    })
        .then(story => {
            if (story.user != req.user.id) {
                res.redirect('/stories');
            } else {
                // Cach 1. Cach cua Brad. K dung o day ma dung cach cua minh. Neu muon xem cach Brad thi Xem helpers/hbs.js
                // Cach 2. Perform check to re-render the form, see edit.handlebars
                var statusCheck = {};
                if (story.status == 'public') {
                    statusCheck.public = true;
                } else if (story.status == 'private') {
                    statusCheck.private = true;
                } else {
                    statusCheck.unpublished = true;
                }

                res.render('stories/edit', {
                    story: story,
                    statusCheck: statusCheck
                });
            }


        });
});

// Process update story after edited
router.put('/:id', ensureAuthenticated, (req, res) => {
    Story.findOne({
        _id: req.params.id
    })
        .then(story => {
            let allowComments;

            // Do we have allowComments in the form submitted?
            if (req.body.allowComments) {
                allowComments = true;
            } else {
                allowComments = false;
            }

            // New values
            story.title = req.body.title;
            story.body = req.body.body;
            story.status = req.body.status;
            story.allowComments = allowComments;

            story.save()
                .then(story => {
                    res.redirect('/dashboard');
                });
        });
});

// Delete story
router.delete('/:id', ensureAuthenticated, (req, res) => {
    Story.deleteOne({
        _id: req.params.id
    })
        .then(() => {
            res.redirect('/dashboard');
        });

    // Cach 2
    /*Story.remove({
        _id: req.params.id
    })
        .then(() => {
            res.redirect('/dashboard');
        });*/
});

// Add comment
router.post('/comment/:id', ensureAuthenticated, (req, res) => {
    Story.findOne({
        _id: req.params.id
    })
        .then(story => {
            const newComment = {
                commentBody: req.body.commentBody,
                commentUser: req.user.id
            };

            // Add comment to array
            story.comments.unshift(newComment);// Push it to the top

            story.save()
                .then(story => {
                    res.redirect(`/stories/show/${story.id}`);
                })
        });
});

module.exports = router;