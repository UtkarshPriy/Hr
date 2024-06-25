
import "./env.js";
import express from 'express';
import { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import User from './src/controller/user.controller.js';
import db from './src/config/mongoose.config.js';
import ejs from 'ejs';
import methodOverride from 'method-override';
import session from 'express-session';
import flash from 'connect-flash';
import path from 'path';
import AWS from 'aws-sdk';
import fs from 'fs';
import multer from 'multer';
import Authicate from './src/middleware/authenticate.js';
import * as orgCntrl from './src/controller/organization.controller.js';
import * as statusCntrl from './src/controller/status.controller.js';
import * as docCntrl from './src/controller/document.cntroller.js';



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
app.use((req, res, next) => {
  res.locals.message = req.flash('message');
  next();
});



// Instances
const userCntrl = new User();
const authCntrl = new Authicate();

// Routes

// Admin
app.get('/',userCntrl.home);
app.get('/signIn',userCntrl.signin);
app.post('/userlogin',authCntrl.defineUser);
app.get('/admin',userCntrl.adminpage);
app.post('/addAdmin2020',userCntrl.addAdmin);
app.get('/addsubadmin',userCntrl.addsubAdminpage);
app.get("/updatesubAdmin",userCntrl.updatesubAdminpage);
app.post("/addsubadmin",userCntrl.addsubAdmin);
app.get('/logout',authCntrl.signOut);
app.post('/changeStatusubadmin',statusCntrl.updateSubadminStatus);

// subadmin
app.get('/subadmin',userCntrl.subadminpage);
app.get('/createOrganization',orgCntrl.createOrgpage);
app.post('/createOrganization',orgCntrl.createOrg);
app.get('/addOwner',userCntrl.createOwnerpage);
app.post('/addOwner',userCntrl.createOwner);

app.get("/updateOwner",userCntrl.updateOwnerpage);
app.post('/changeStatusowner',statusCntrl.updateOwnerStatus);

// Owner
app.get('/owner',userCntrl.ownerpage);
app.get('/addEmployee',userCntrl.addEmployeepage);
app.post('/addEmployee',userCntrl.createEmployee);
app.get('/updateEmployee',userCntrl.updateEmployeepage); 
app.post('/changeStatusemployee',statusCntrl.updateEmployeeStatus);




app.get('/uploadDoc',docCntrl.uploadDocument);
const upload = multer({ dest: 'uploads/' }); // Temporary storage

app.post('/uploadDocument', upload.single('document'), docCntrl.uploadDocumentAws);
// app.get('/downloadDocument', docCntrl.downloadDocument);



// Search by document name
app.get('/searchByDocName', docCntrl.searchDocuments);

// Search by employee email
app.get('/searchByEmployee', docCntrl.searchDocumentsByEmployee);

// Download document
app.post('/downloadDocument', docCntrl.downloadDocument);
//test
app.post('/downloadDocumentt', docCntrl.addSignatureToS3Document);


app.get('/docStatus',docCntrl.docStatus);
app.get('/sendDoc',docCntrl.sendDocpage);
app.post('/sendDoc',docCntrl.sendDoc);
app.post('/sign-pdf',docCntrl.signedDoc);


app.get('/employee',userCntrl.employeepage);
app.post('/signDocument',docCntrl.signDocument);
app.post('/rejectSign',docCntrl.rejectSign);






export default app;