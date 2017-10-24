const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');


const app = express();

//Express session
app.use(session({
secret: 'secret',
resave: true,
saveUninitialized: true
}));

app.use(flash());

//Global variables
app.use(function (req, res, next) {
res.locals.success_msg = req.flash('success_msg');
res.locals.error_msg = req.flash('error_msg');
res.locals.error = req.flash('error');
next();
});

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/vidjot-devv', {
    useMongoClient: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));



//Load the idea Model

require('./models/Idea');
const Idea = mongoose.model('ideas');
const port = 5000;

//Express handlebars Middle-ware 
app.engine('handlebars', exphbs({
defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({
extended: false
}));
// parse application/json 
app.use(bodyParser.json());
app.use(methodOverride('_method'))

//routes
app.get('/', (req, res) => {
const title = "Welcome to Index page";
res.render('index', {
    title: title
});
});

app.get('/ideas', (req, res) => {
Idea.find({})
    .sort({
        date: 'desc'
    })
    .then(ideas => {
        res.render('ideas/index', {
            ideas: ideas
        });
    });
});



app.get('/about', (req, res) => {
res.render('about');
});

app.get('/ideas/add', (req, res) => {
res.render('ideas/add');
});

app.put('/ideas/:id', (req, res) => {
Idea.findOne({
    _id: req.params.id
}).then(idea => {
    idea.title = req.body.title;
    idea.details = req.body.details;
    idea.save().then(idea => {
        req.flash('success_msg', 'Video idea updated');
        res.redirect('/ideas/')
    })

})
});




app.get('/ideas/edit/:id', (req, res) => {
Idea.findOne({
    _id: req.params.id
}).then(idea => {
    res.render('ideas/edit', {
        idea: idea
    });
});
});

app.post('/ideas', (req, res) => {
let errors = [];

if (!req.body.title) {
    errors.push({
        text: 'Please enter the title'
    });
}

if (!req.body.details) {
    errors.push({
        text: 'Please enter the details'
    });
}

if (errors.length > 0) {
    res.render('ideas/add', {
        errors: errors,
        title: req.body.title,
        details: req.body.details
    })
} else {
    const newUser = {
        title: req.body.title,
        details: req.body.details
    }

    new Idea(newUser)
        .save()
        .then(idea => {
            req.flash('success_msg', 'Video successfully added');
            res.redirect('/ideas');
        })
}
})


// Delete Idea
app.delete('/ideas/:id', (req, res) => {
Idea.remove({
        _id: req.params.id
    })
    .then(() => {
        req.flash('success_msg', 'Video idea removed');
        res.redirect('/ideas');
    });
});





app.listen(port, () => {
console.log("server has started" + port);

})