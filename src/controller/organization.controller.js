import Organization from '../model/organization.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import flash from 'connect-flash';

const privateKey = process.env.JWT_SECRET || "Utkarsh";


export const createOrgpage = (req,res)=>{
    res.status(200).render('create_organization');
};

export const createOrg = async(req,res)=>{
    try{
        const token = req.cookies['jwt'];
        const{name,address,email,primaryOwner,phoneNo,plan,renewDate} = req.body;
        // Add already exists check
        const userExists = await Organization.findOne({name});
        if(userExists){
            req.flash('message', 'Organization of same name Already Registered');
            return res.render('add_sub_admin',{ message: req.flash('message') });
        }
        const decoded = jwt.verify(token, privateKey);
        const updatedby = decoded.email;
        

       // Adding new Organization 

        let newOrganization = {
            name:name,
            address:address,
            primaryOwner:primaryOwner,
            creator:updatedby,
            lastUpdatedBy: updatedby,
            email:email,
            phoneNo:phoneNo,
            plan:plan,
            renewDate:renewDate
        };
        await Organization.create(newOrganization);
        req.flash('message', 'Organization Registered');
        return res.render('create_organization',{ message: req.flash('message') });
    }catch(error){
        console.log(error);
        res.status(401).redirect('/');
    }
}