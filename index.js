
import "./env.js";
import express from 'express';
import { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import User from './src/controller/user.controller.js';
import db from './src/config/mongoose.config.js';
import ejs from 'ejs';
import methodOverride from 'method-override';
import session from 'express-session';
import flash from 'connect-flash';
import Authicate from './src/middleware/authenticate.js';



const app = express();

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.set('views', path.join(path.resolve(), 'src', 'view'));
app.use(express.static(path.join(path.resolve(), 'src', 'public')));
// app.use(express.static(path.join('src', 'public')));

app.use(express.static('public'));
app.use(urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET_KEY ||'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true if using HTTPS
  }));

app.use(flash());


// Instances
const userCntrl = new User();
const authCntrl = new Authicate();

// Routes
app.get('/',userCntrl.home);
app.get('/signIn',userCntrl.signin);
// app.post('/userlogin',userCntrl.loginAdmin);

app.post('/userlogin',authCntrl.defineUser);
app.post('/addAdmin',userCntrl.addAdmin);
// app.post('/adminlogin',userCntrl.loginAdmin);
app.get('/addsubadmin',userCntrl.addsubAdminpage);
app.get("/updatesubAdmin",userCntrl.updatesubAdminpage);
app.post("/addsubadmin",userCntrl.addsubAdmin);









export default app;