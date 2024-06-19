import UserList from '../model/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

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

    loginAdmin = async (req, res) => {
        const { username, password } = req.body;
      
        try {
          // Find user by email
          const user = await UserList.findOne({ username });
          console.log(user);
      
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
      
          // Compare passwords
          const isMatch = await bcrypt.compare(password, UserList.password);
      
          if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
          }
      
          // Generate JWT token
          const token = jwt.sign({ userId: user._id }, privateKey, { expiresIn: '1h' });
          
          return res.cookie('jwt', token, {
            httpOnly: true
        }).status(200).render('admin_welcome');
        } catch (error) {
          console.error(error);
          console.log(error);
          res.status(500).json({ message: 'Server error' });
        }
      };

}