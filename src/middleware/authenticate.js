import UserList from '../model/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import flash from 'connect-flash';
const privateKey = process.env.JWT_SECRET || "Utkarsh";
export default class Authicate{
    defineUser = async (req, res) => {
        const { email, password } = req.body;
      
        try {
          // Find user by email
          const user = await UserList.findOne({ email });

          if (!user) {
            console.log("user");
            req.flash('message', 'User not found');
            return res.render('login',{ message: req.flash('message') });
          }
          // Compare passwords
          const isMatch = await bcrypt.compare(password, user.password);
          
          
          if (!isMatch) {
            req.flash('message', 'Invalid credentials');
            return res.render('login',{ message: req.flash('message') });
          }
      
          // Generate JWT token
          const token = jwt.sign({ email:email, passcode:password, role:user.role, status: user.status }, privateKey, { expiresIn: '1h' });
          if(user.role ==='admin'){
            return res.cookie('jwt', token, {
                httpOnly: true
            }).status(200).render('admin_welcome');
          }
          else if(user.role ==='sub_admin'){
            return res.cookie('jwt', token, {
                httpOnly: true
            }).status(200).render('admin_welcome');
          }
          
        } catch (error) {
          console.error(error);
          console.log(error);
          res.status(500).json({ message: 'Server error' });
        }
      };
      signOut = (req, res) => {
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0)
        });
        return res.status(200).render('login');

    }
}