require('dotenv').config();

let express = require('express');
let app = express();

let passport = require('passport');

let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let flash = require('express-flash');
let bcrypt = require('bcrypt');
let cookieParser = require('cookie-parser');

let { db } = require('./database/init');
let DbUtil = require('./database/utilities');
let dbUtil = new DbUtil(db);

var mongo = require('mongodb');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/sessiondb', {useNewUrlParser: true, useUnifiedTopology: true});

const mdb = mongoose.connection;
mdb.on('error', console.error.bind(console, 'connection error:'));
mdb.once('open', function() {
  console.log('mongodb is connected');
});

let passportInit = require('./auth');
passportInit(passport, dbUtil.getUserByEmail, dbUtil.getUserById);



app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(flash());
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(session({
    name:'session-id-saurab',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store:new MongoStore({mongooseConnection:mongoose.connection})
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', isLoggedIn, (req, res)=>{
    req.session.boop = 'hello';
    console.log(req.signedCookies);
    res.locals.name = req.user.name;
    res.render('index.ejs');
})

app.get('/register', isLogInNecessary, (req, res)=>{
    res.render('register.ejs');
})

app.post('/register',  isLogInNecessary, async (req,res)=>{

    if(req.body.email && req.body.name && req.body.password){
        try{
            let hashedPassword = await bcrypt.hash(req.body.password,10);
    
            let user = {
                email:req.body.email,
                name:req.body.name,
                password:hashedPassword
            }

            let userModel = await dbUtil.createUser(user);

            if(userModel){
                req.login(userModel, (err)=>{
                    if(err) { res.redirect('/login')}
                    return res.redirect('/');
                })
                
            } else {
                req.flash()
                res.redirect('/register');
            }
        } catch(err) {
            res.redirect('/register');
        }
    } else {
        req.flash('error', 'Insufficient Data');
        console.log(res.locals);
        res.redirect('/register');
    }

})

app.get('/login',  isLogInNecessary, (req, res)=>{
    res.render('login.ejs');
})

app.post('/login',  isLogInNecessary, passport.authenticate('local'), (req, res)=>{
    req.flash('success','You are in');
    res.redirect('/');
    
})

app.post('/logout', (req, res)=>{
    req.logOut();
    res.redirect('/login');
})

async function isLogInNecessary(req, res, next){
    if(req.user){
        req.flash('error','You were already logged in.')
        res.redirect('/');
    } else {
        next();
    }
}

async function isLoggedIn(req, res, next){
    if(req.user){
        next();
    } else {
        req.flash('error', 'how about you log in first?')
        res.redirect('/login');
    }
}

app.listen(3006);