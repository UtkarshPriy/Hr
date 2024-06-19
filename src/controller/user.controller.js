import UserList from '../model/user.model.js';

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

}