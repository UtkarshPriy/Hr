import UserList from '../model/user.model.js';





export const updateSubadminStatus = async(req,res)=>{
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
export const updateOwnerStatus = async(req,res)=>{
    try{
        // Add last Updated By
        const { email,status } = req.body;
        const updatedUser = await  UserList.findOneAndUpdate({ email: email }, { status }, { new: true });
        const owner_list = await UserList.find({role:"owner"});
        req.flash('message', 'Status Updated');
        return res.render('update_owner',{ message: req.flash('message'), users:owner_list});
    }catch(error){
        console.log(error);
        req.flash('message', 'Unable to Update');
        return res.render('update_owner',{ message: req.flash('message'), users:owner_list});
    }
    

};