const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect('mongodb://localhost/my_db');
var userSchema = mongoose.Schema({
    id: String,
    password: String
});

var User = mongoose.model("User", userSchema);

router.get('/signup', (req, res) => {
    res.render('signup');
})
router.post('/signup', (req, res) => {
    if (!req.body.id || !req.body.password) {
        res.status("400");
        res.send("Invalid details");
    } else {
        var user = User.find({ id: req.body.id })
        user.then((function (user) {
            if (user.length)
                if (user[0].id === req.body.id) {
                    res.render('show_message', {
                        message: "User already exists!. Login or choose another user id", type: "error"
                    });
                    return;
                }
            var newUser = new User({ id: req.body.id, password: req.body.password });
            newUser.save(function (err, User) {
                if (err)
                    res.render('show_message', {
                        message: 'Database error', type: 'error'
                    });
                else
                    res.render('show_message', {
                        message: 'Signup done!', type: 'success', user: newUser
                    });
            });

        }))

    }
})
module.exports = router;