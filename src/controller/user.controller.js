
export default class User{

    home= (req,res)=>{
        res.status(200).render('welcome');
    }
    signin = (req,res)=>{
        res.status(200).render('login');
    }

}