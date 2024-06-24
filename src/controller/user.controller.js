import UserList from '../model/user.model.js';
import Organization from '../model/organization.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import flash from 'connect-flash';
import Doc from '../model/document.model.js';// remove this
import DocEmployeeRelation from '../model/docEmployeeRelation.model.js';

const privateKey = process.env.JWT_SECRET || "Utkarsh";

export default class User{
    
    
    home= async(req,res)=>{
        const documents = await Doc.find({});

        res.status(200).render('send_doc',{documents:documents});
        // res.status(200).render('signdoc',{documents:documents});  
        // res.status(200).render('welcome');
    }
    signin = (req,res)=>{
        res.status(200).render('login');
    }

    addAdmin = async(req,res)=>{
        const{username,email,password,role} = req.body;
        let newUser = {
            username: username,
            email: email,
            password: password,
            role:"admin"
        };
        await UserList.create(newUser);
        res.status(201).send("Admin Created");
    }

    addsubAdminpage = (req,res)=>{
        res.status(200).render("add_sub_admin");
    };
    
    updatesubAdminpage = async(req,res)=>{
        const sub_admin_list = await UserList.find({role:"sub_admin"});
        res.status(200).render("update_sub_admin",{users:sub_admin_list});

    };
    updateEmployeepage = async(re,res)=>{
        const employee_list = await UserList.find({role:"employee"});
        res.status(200).render("update_employee",{users:employee_list});
    };
    adminpage = async(req,res)=>{
        // const sub_admin_list = await UserList.find({role:"sub_admin"});,{users:sub_admin_list}
        res.status(200).render("admin_welcome");
    };
    subadminpage = (req,res)=>{
        res.status(200).render("sub_admin_welcome");
    };
    ownerpage = (req,res)=>{
        res.status(200).render("owner_welcome");
    };
    employeepage = async(req,res)=>{
        try{
            const token = req.cookies['jwt'];
            const decoded = jwt.verify(token, privateKey);
            const email = decoded.email;
            const doc_list = await DocEmployeeRelation.find({employee:email,status:'pending'});
            res.status(200).render("signdoc",{documents:doc_list});
        }catch(error){
            console.log(error);
        }
    };
    // employeepage =(req,res)=>{
    //     res.status(200).render("owner_welcome");
    // };
    addsubAdmin = async(req,res)=>{
        try{
            const token = req.cookies['jwt'];
            const{username,email,password} = req.body;
            // Add already exists check
            const userExists = await UserList.findOne({email});
            if(userExists){
                req.flash('message', 'Email Already Registered');
                return res.render('add_sub_admin',{ message: req.flash('message') });
            }
            const decoded = jwt.verify(token, privateKey);
            const updatedby = decoded.email;

            

            let newSubsdmin = {
                username:username,
                email:email,
                password:password,
                role:"sub_admin",
                lastUpdatedBy: updatedby,
                organizationName: 'HRCovered'
            };
            await UserList.create(newSubsdmin);
            req.flash('message', 'Sub admin Created');
            return res.render('add_sub_admin',{ message: req.flash('message') });
        }catch(error){
            console.log(error);
            res.status(401).send('Internal Server Error');
        }
    };

    
    updateOwnerpage = async(req,res)=>{
        try{
            const owner_list = await UserList.find({role:"owner"});
            res.status(200).render("update_owner",{users:owner_list});
        }catch(error){
            console.log(error);
        }
    };
    createOwnerpage = async(req,res)=>{
        try{
            const org_list = await Organization.find({},'name');  // Required for drop down of Org. List
            res.status(200).render("create_owner",{organizations:org_list});
        }catch(error){
            console.log(error);
        }
    };
    addEmployeepage = (req,res)=>{

        res.status(200).render("create_employee");
    };

    createOwner = async(req,res)=>{
        try{
            const token = req.cookies['jwt'];
            const{username,email,password,organizationName} = req.body;                 
            // Add already exists check
            const userExists = await UserList.findOne({email});
            if(userExists){
                const org_list = await Organization.find({},'name');
                req.flash('message', 'Email Already Registered');
                return res.render('create_owner',{organizations:org_list, message: req.flash('message') });
            }
            const decoded = jwt.verify(token, privateKey);
            const updatedby = decoded.email;

            

            let newOwner = {
                username:username,
                email:email,
                password:password,
                role:"owner",
                lastUpdatedBy: updatedby,
                organizationName: organizationName
            };
            await UserList.create(newOwner);
            const org_list = await Organization.find({},'name');
            req.flash('message', 'Owner Created');
            return res.render('create_owner',{ message: req.flash('message'),organizations:org_list });
        }catch(error){
            console.log(error);
            res.status(401).redirect('/');
            
        }
    };
    createEmployee = async(req,res)=>{
        try{
            const token = req.cookies['jwt'];
            const{username,email,password} = req.body;                 
            // Add already exists check
            const userExists = await UserList.findOne({email});
            if(userExists){
                req.flash('message', 'Email Already Registered');
                return res.render('create_employee',{ message: req.flash('message')});
                // return res.render('create_owner');

            }
            const decoded = jwt.verify(token, privateKey);
            const updatedby = decoded.email;
            const organizationName = decoded.organizationName;  // employee has same organizationName as of owner

            

            let newEmployee = {
                username:username,
                email:email,
                password:password,
                role:"employee",
                lastUpdatedBy: updatedby,
                organizationName: organizationName
            };
            await UserList.create(newEmployee);
            req.flash('message', 'Employee Created');
            return res.render('create_employee',{ message: req.flash('message')});
        }catch(error){
            console.log(error);
            res.status(401).redirect('/');
            
        }
    };

}