module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {// req.isAuthenticated() is passport's stuff
            return next();
        }
        res.redirect('/');
    },
    // You can export more function by adding another item in this object, i.e.
    // ", somefunction: function() {}". See ideas.js to see how to import multiple things from this module
    ensureGuest: function(req, res, next) {
        if (req.isAuthenticated()) {// req.isAuthenticated() is passport's stuff
            res.redirect('/dashboard');
        }
        else {
            return next();
        }
    }
};