
import "./env.js";
import express from 'express';
import { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import User from './src/controller/user.controller.js';
import db from './src/config/mongoose.config.js';
import ejs from 'ejs';
import methodOverride from 'method-override';

const app = express();

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.set('views', path.join(path.resolve(), 'src', 'view'));
app.use(express.static(path.join(path.resolve(), 'src', 'public')));
app.use(urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(express.json());


const userCntrl = new User();


app.get('/',userCntrl.home);
app.get('/signIn',userCntrl.signin);
app.post('/addAdmin',userCntrl.addAdmin);
app.post('/adminlogin',userCntrl.loginAdmin);









export default app;