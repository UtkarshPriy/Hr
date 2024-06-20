import UserList from '../model/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import flash from 'connect-flash';

const privateKey = process.env.JWT_SECRET || "Utkarsh"

export default class User{

    home= (req,res)=>{
        res.status(200).render('create_organization'); //Testing
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
    }
    updatesubAdminpage = async(req,res)=>{
        const sub_admin_list = await UserList.find({role:"sub_admin"});
        res.status(200).render("update_sub_admin",{users:sub_admin_list});

    }
    adminpage = async(req,res)=>{
        const sub_admin_list = await UserList.find({role:"sub_admin"});
        res.status(200).render("admin_welcome",{users:sub_admin_list});
    }
    subadminpage = (req,res)=>{
        res.status(200).render("sub_admin_welcome");
    }
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
            const updatedby = decoded.name;

            

            let newSubsdmin = {
                username:username,
                email:email,
                password:password,
                role:"sub_admin",
                lastUpdatedBy: updatedby
            };
            await UserList.create(newSubsdmin);
            req.flash('message', 'Sub admin Created');
            return res.render('add_sub_admin',{ message: req.flash('message') });
        }catch(error){
            console.log(error);
            res.status(401).send('Internal Server Error');
        }
    };

    updateUserStatus = async(req,res)=>{
        try{
            // Add last Updated By
            const { email,status } = req.body;
            const updatedUser = await  UserList.findOneAndUpdate({ email: email }, { status }, { new: true });
            const sub_admin_list = await UserList.find({role:"sub_admin"});
            req.flash('message', 'Status Updated');
            return res.render('update_sub_admin',{ message: req.flash('message'), users:sub_admin_list});
        }catch(error){
            console.log(error);
            req.flash('message', 'Unable to Update');
            return res.render('update_sub_admin',{ message: req.flash('message'), users:sub_admin_list});
        }
        

    };

}