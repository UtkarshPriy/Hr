import UserList from '../model/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import flash from 'connect-flash';

const privateKey = process.env.JWT_SECRET || "Utkarsh"

export default class User{

    home= (req,res)=>{
        res.status(200).render('welcome');
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
    updatesubAdminpage = (req,res)=>{
        res.status(200).render("update_sub_admin");

    }
    addsubAdmin = async(req,res)=>{
        try{
            const token = req.cookies['jwt'];
            const{username,email,password} = req.body;
            const decoded = jwt.verify(token, privateKey);
            const updatedby = decoded.name;

            // Add already exists check
            let newSubsdmin = {
                username:username,
                email:email,
                password:password,
                role:"sub_admin",
                lastUpdatedBy: updatedby
            };
            await UserList.create(newSubsdmin);
        }catch(error){
            console.log(error);
            res.status(401).send('Internal Server Error');
        }
        


    }

}