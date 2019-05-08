const express = require('express');
const app = express();
const mongoose = require('mongoose');
var path = require('path');
const multer = require('multer');
var upload = multer();

mongoose.connect('mongodb://localhost/my_db');


const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const session = require('express-session');
app.use(session({ secret: "tapjam" }));
const things = require('./things.js');
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));
var Users = [];
var personSchema = mongoose.Schema({
    name: String,
    age: Number,
    nationality: String
});

var Person = mongoose.model("Person", personSchema);

app.use('/things', things);
//signup view
app.get('/signup', (req, res) => {
    res.render('signup');
})

//signup
app.post('/signup', (req, res) => {
    if (!req.body.id || !req.body.password) {
        res.status("400");
        res.send("Invalid details");
    } else {
        Users.filter(function (user) {
            if (user.id === req.body.id) {
                res.render('signup', {
                    message: "User already exists!. Login or choose another user id"
                });
            }
        });
        var newUser = { id: req.body.id, password: req.body.password };
        Users.push(newUser);
        req.session.user = newUser;
        res.render('protected_page');
    }
});

function checkSignIn(req, res) {
    if (req.session.user) {
        next();
    } else {
        var err = new Error("not logged in!");
        console.log(req.session.user)
        next(err);
    }
}


app.get('/protected_page', checkSignIn, (req, res) => {
    res.render('protected_page', { id: res.session.user.id })
})
app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/login', (req, res) => {
    if (!req.body.id || !req.body.password) {
        res.render('login', { message: "Please enter both id and password" });
    } else {
        if (Users.length)
            Users.filter(function (user) {
                if (user.id === req.body.id && user.password === req.body.password) {
                    req.session.use = user;
                    res.render('protected_page', { id: user.id })
                }
            });
        else
            res.render('login', { message: "Invalid credential" });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(function () {
        console.log('user logged out');
    });
    res.redirect('/login')
})
app.use('/protected_page', function (err, req, res, next) {
    console.log(err)
    res.redirect('/login');
});
app.get('/visit', function (req, res) {
    if (req.session.page_views) {
        req.session.page_views++;
        res.send("You visited this page" + req.session.page_views + "times")
    } else {
        req.session.page_views = 1;
        res.send("Welcome to this page for first time")
    }
});
app.get('/cookie', function (req, res) {
    res.cookie('name', 'express', { expire: 36000 + Date.now() }).send('cookie set'); //Sets name = express
});
//getting form to submit person data
app.get('/person', (req, res) => {
    console.log('Cookies: ', req.cookies);
    res.render('person')
});

//adding person 
app.post('/person', function (req, res) {
    var personInfo = req.body; //Get the parsed information

    if (!personInfo.name || !personInfo.age || !personInfo.nationality) {
        res.render('show_message', {
            message: "Sorry, you provided worng info", type: "error"
        });
    } else {
        var newPerson = new Person({
            name: personInfo.name,
            age: personInfo.age,
            nationality: personInfo.nationality
        });

        newPerson.save(function (err, Person) {
            if (err)
                res.render('show_message', { message: "Database error", type: "error" });
            else
                res.render('show_message', {
                    message: "New person added", type: "success", person: personInfo
                });
        });
    }
});

//getting all person
app.get('/people', (req, res) => {
    console.log('Cookies: ', req.cookies);
    Person.find(function (err, response) {
        res.json(response)
    })
})

//getting person by id
app.get('/people/:id', (req, res) => {
    Person.find({ _id: req.params.id }, function (err, response) {
        res.json(response)
    })
})

//find by name and age
app.get('/person/:name/:nationality', (req, res) => {
    Person.find({ name: req.params.name, nationality: req.params.nationality }, function (err, response) {
        if (response.length == 0) {
            res.send('Not found')
        } else {
            res.json(response)
        }
    })
})
app.use('/things', (req, res, next) => {
    console.log(Date.now());
    next();
})

app.get('/first_template', function (req, res) {
    res.render('first_view');
});

app.get('*', (req, res) => {
    res.send('Sorry this is an invalid route')
})
app.listen(3000);
