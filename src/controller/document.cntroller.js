import path from 'path';
import AWS from 'aws-sdk';
import fs from 'fs';
import multer from 'multer';
import flash from 'connect-flash';
import Doc from '../model/document.model.js';
import { create } from 'domain';
import jwt from 'jsonwebtoken';
import DocEmployeeRelation from '../model/docEmployeeRelation.model.js';
import UserList from '../model/user.model.js';
import nodemailer from 'nodemailer';
// import DocEmployeeRelation from '../model/docEmployeeRelation.model.js';

const privateKey = process.env.JWT_SECRET || "Utkarsh";


// AWS S3 configuration
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
export const uploadDocument = async (req,res)=>{
    return res.render('upload_doc_by_owner');

};


export const uploadDocumentAws = (req, res) => {
    
    const file = req.file;
    console.log('File Object:', file.path); 
    const documentName = req.body.documentName;

    // Read file from local storage
    const fileStream = fs.createReadStream(file.path);

    // Upload to S3
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${Date.now()}_${documentName}`, // File name you want to save as in S3
        Body: fileStream,
        ContentType: file.mimetype,
    };
    

    s3.upload(params, async(err, data) => {
        // Delete the file from local storage
        fs.unlinkSync(file.path);

        if (err) {
            console.error('Error uploading to S3:', err);
            res.status(500).send('Error uploading to S3');
            return;
        };
     // Successful upload
     const fileUrl = data.Location; // Get the URL of the uploaded file
     const fileKey = data.Key; // Get the key of the uploaded file

     // Now you can use fileUrl and fileKey variables as needed
     console.log('File URL:', fileUrl);
     console.log('File Key:', fileKey);
     // Saving Doc details in Doc Schema
     try{
        const token = req.cookies['jwt'];
        const decoded = jwt.verify(token, privateKey);
        const owner = decoded.email;
        const organizationName = decoded.organizationName;
        let newDoc = {
            docName:documentName,
            key:fileKey,
            uploader:owner,
            docURL:fileUrl,
            organizationName:organizationName,
        };
        await Doc.create(newDoc);
     }catch(error){
        console.log(error);
        res.status(401).redirect('/');
     }     
     
        // Successful upload
        req.flash('message', 'File Uploaded');
        res.render('upload_doc_by_owner',{ message: req.flash('message') }); // Redirect to your desired route
    });
};

// Download document function
export const downloadDocument = async (req, res) => {
    try {
        const { key } = req.body;

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        };

        s3.getObject(params, (err, data) => {
            if (err) {
                console.error('Error downloading from S3:', err);
                res.status(500).send('Error downloading from S3');
                return;
            }

            res.attachment(key); // Sets the filename for the download
            res.send(data.Body);
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};


/////////////////

// Search documents by document name
export const searchDocuments = async (req, res) => {
    const { docName } = req.query;

    try {
        const documents = await DocEmployeeRelation.find({ docName: new RegExp(docName, 'i') });
        res.render('searchResults', { documents, query: docName });
    } catch (error) {
        console.error('Error searching documents:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Search documents by employee email
export const searchDocumentsByEmployee = async (req, res) => {
    const { email } = req.query;

    try {
        const documents = await DocEmployeeRelation.find({ employee: new RegExp(email, 'i') });
        res.render('searchResults', { documents, query: email });
    } catch (error) {
        console.error('Error searching documents:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const docStatus = async(req,res)=>{
    const docList = await DocEmployeeRelation.find({});
    res.status(200).render('search_signed',{documents:docList});

};

export const sendDocpage = async(req,res)=>{
    const docList = await Doc.find({});
    res.status(200).render('send_doc',{documents:docList});
};

export const sendDoc = async(req,res)=>{
    const{id,owner,organizationName} = req.body;
    console.log(organizationName);
    const doc_list = await Doc.findById({_id:id}).lean();

    // const employee_list = await UserList.find({organizationName:organizationName,role:'employee',status:'active'}).lean();
    // console.log(employee_list);

    // const newEntries = doc_list.flatMap(doc=>employee_list.map(emp=>(
            // return{
    //     owner:owner,
    //     employee:emp.email ,
    //     docName:doc.docName,
    //     key:doc.key,
    //     docURL:doc.docURL
    // })));
    const employee_list = await UserList.find({ organizationName: organizationName, role: 'employee', status: 'active' }).lean();
    const newEntries = employee_list.map(emp => (
        {
        owner: owner,
        employee: emp.email,
        docName: doc_list.docName,
        key: doc_list.key,
        docURL: doc_list.docURL
    }));
    await DocEmployeeRelation.insertMany(newEntries);
    employee_list.flatMap(emp=>{

        // Create a transporter using SMTP transport
        // const transporter = nodemailer.createTransport({
        //     service: process.env.SERVICE,
        //     auth: {
        //       user: process.env.EMAIL_USER,
        //       pass: process.env.EMAIL_PASSWORD,
        //     },
        // });


        // const transporter = nodemailer.createTransport({
        //     host: 'smtp-relay.brevo.com',
        //     port: 587,
        //     secure: false, // true for 465, false for other ports
        //     auth: {
        //         user: process.env.BREVO_USER, // your Brevo email address
        //         pass: process.env.BREVO_PASS, // your Brevo SMTP password
        //     },
        // });
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port: 465,
            secure:true,
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.SMTPKEY
            },
        });

        // Define the email options
        const mailOptions = {
            from:process.env.EMAIL_USER,  //'test@bslhg.com'|| process.env.BREVO_USER,
            to: 'utkarsh.priy@gmail.com',
            subject: 'Pending Docs to acknowledge on SignaTrack',
            html: '<h1>Hi, please click to review pending docs</h1><p>Click <a href="https://your-link-here.com">here</a> to review the documents.</p>', // HTML body with link
        };
        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
            console.error('Error sending email:', error);
            } else {
            console.log('Email sent:', info.response);
            }
        });


    });    
    //Update isSent
    await Doc.findByIdAndUpdate(id,{isSent:true});
    const docList = await Doc.find({});
    req.flash('message', 'Document sent!!');
    res.render('send_doc',{documents:docList,message: req.flash('message')});
};

// Download signedDoc

export const signedDoc = async (req, res) => {
    const { name, location, reason, contact, timestamp, signatureImage, s3Key } = req.body;

    try {
        // Fetch the existing PDF from S3
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key
        };

        const data = await s3.getObject(params).promise();
        const existingPdfBytes = data.Body;

        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Get the last page of the PDF
        const pages = pdfDoc.getPages();
        const lastPage = pages[pages.length - 1];

        // Determine where the text ends on the last page
        const { height } = lastPage.getSize();
        let y = height - 50; // Start a little below the top of the page

        // Loop through all the text items on the page and find the lowest y coordinate
        lastPage.node.contents.forEach(content => {
            content.node.operands.forEach(operand => {
                if (Array.isArray(operand)) {
                    operand.forEach(element => {
                        if (element.y < y) y = element.y;
                    });
                }
            });
        });

        // Add signature details below the existing content
        const padding = 20; // Space between existing content and new signature
        y -= padding;

        lastPage.drawText(`Name: ${name}`, { x: 50, y: y, size: 12 });
        y -= 20;
        lastPage.drawText(`Location: ${location}`, { x: 50, y: y, size: 12 });
        y -= 20;
        lastPage.drawText(`Reason: ${reason}`, { x: 50, y: y, size: 12 });
        y -= 20;
        lastPage.drawText(`Contact Information: ${contact}`, { x: 50, y: y, size: 12 });
        y -= 20;
        lastPage.drawText(`Date and Time: ${timestamp}`, { x: 50, y: y, size: 12 });
        y -= 40; // Leave more space for the signature image

        // Add the signature image to the PDF
        if (signatureImage) {
            const signatureBytes = fs.readFileSync(signatureImage);
            const signatureImageEmbed = await pdfDoc.embedPng(signatureBytes);
            const signatureDims = signatureImageEmbed.scale(0.5);
            lastPage.drawImage(signatureImageEmbed, {
                x: 50,
                y: y - signatureDims.height,
                width: signatureDims.width,
                height: signatureDims.height,
            });
        }

        // Save the signed PDF
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync('signed_document.pdf', pdfBytes);

        res.send('PDF signed successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while signing the PDF');
    }
};


// Download document function
// export const downloadDocument = async (req, res) => {
//     try {
//         const { key } = req.body;

//         const params = {
//             Bucket: process.env.AWS_BUCKET_NAME,
//             Key: key,
//         };

//         s3.getObject(params, (err, data) => {
//             if (err) {
//                 console.error('Error downloading from S3:', err);
//                 res.status(500).send('Error downloading from S3');
//                 return;
//             }

//             res.attachment(key); // Sets the filename for the download
//             res.send(data.Body);
//         });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };