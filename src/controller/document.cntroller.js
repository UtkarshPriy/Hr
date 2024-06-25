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
import Signature from '../model/signature.model.js';
import nodemailer from 'nodemailer';
import { PDFDocument, rgb } from 'pdf-lib';



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
            Key:fileKey,
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
        const { Key } = req.body;

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: Key,
        };

        s3.getObject(params, (err, data) => {
            if (err) {
                console.error('Error downloading from S3:', err);
                res.status(500).send('Error downloading from S3');
                return;
            }

            res.attachment(Key); // Sets the filename for the download
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
    const token = req.cookies['jwt'];
    const decoded = jwt.verify(token, privateKey);
    const owner = decoded.email;
    const docList = await DocEmployeeRelation.find({owner:owner});
    res.status(200).render('search_signed',{documents:docList});

};

export const sendDocpage = async(req,res)=>{
    const token = req.cookies['jwt'];
    const decoded = jwt.verify(token, privateKey);
    const owner = decoded.email;
    const docList = await Doc.find({uploader:owner});
    res.status(200).render('send_doc',{documents:docList});
};

export const sendDoc = async(req,res)=>{
    const{id,owner,organizationName} = req.body;
    console.log(organizationName);
    const doc_list = await Doc.findById({_id:id}).lean();

    
    const employee_list = await UserList.find({ organizationName: organizationName, role: 'employee', status: 'active' }).lean();
    const newEntries = employee_list.map(emp => (
        {
        owner: owner,
        employee: emp.email,
        docName: doc_list.docName,
        Key: doc_list.Key,
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
            to: emp.email, //'utkarsh.priy@gmail.com',
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
// Save Signature

export const signDocument = async (req, res) => {
    const { docName, Key,emp_email, name, url, owner, location, reason, contact, datetime } = req.body;
    try {
        let newSign = {
            docName: docName,
            Key: Key,
            url: url,
            owner: owner,
            employee_name: name,
            employee_email:emp_email,
            signLocation: location,
            signReason: reason,
            signContact: contact,
            signDatetime: datetime,
            status: 'signed',
        };
        const signature = await Signature.create(newSign);
        req.flash('message', 'Document Signed');
        res.status(201).redirect('/employee');
        await DocEmployeeRelation.findOneAndUpdate(
            { owner: owner, docName: docName, employee: emp_email },
            { status: 'signed' }
        );
    } catch (error) {
        console.log(error);
        req.flash('error', 'Error signing document');
        res.status(500).redirect('/employee');
    }
};
// Reject to Sign

export const rejectSign = async (req, res) => {
    const { docName, Key,emp_email, name, url, owner, datetime } = req.body;
    try {
        let newSign = {
            docName: docName,
            Key: Key,
            url: url,
            owner: owner,
            employee_name: name,
            employee_email:emp_email,
            signDatetime: datetime,
            status: 'rejected',
        };
        // console.log(newSign);
        const signature = await Signature.create(newSign);
        req.flash('message', 'Document Rejected');
        res.status(201).redirect('/employee');
        await DocEmployeeRelation.findOneAndUpdate(
            { owner: owner, docName: docName, employee: emp_email },
            { status: 'rejected' }
        );
    } catch (error) {
        console.log(error);
        req.flash('error', 'Error rejecting document');
        res.status(500).redirect('/employee');
    }
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


// Actual Download signedDoc


export const addSignatureToS3Document = async (req, res) => {
    const { Key, employee } = req.body;
    const bucketName = process.env.AWS_BUCKET_NAME; // Replace with your S3 bucket name

    try {
        const signatureInfo = await Signature.findOne({ Key: Key, employee_email: employee });
        if (!signatureInfo) {
            return res.status(404).send({ error: 'Signature info not found' });
        }

        const { employee_name, signLocation, signReason, signContact, signDatetime } = signatureInfo;
        const signatureText = `
Digital Signature
Name: ${employee_name}
Location: ${signLocation}
Reason: ${signReason}
Contact: ${signContact}
Timestamp: ${signDatetime}
`;
        // console.log(signatureText);
        // Download the PDF document from S3
        const { Body } = await s3.getObject({ Bucket: bucketName, Key: Key }).promise();
        const existingPdfBytes = Body;

        // Load the existing PDF into pdf-lib
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Get the last page of the document
        const pages = pdfDoc.getPages();
        const lastPage = pages[pages.length - 1];

        // Draw the signature text at the bottom of the last page
        lastPage.drawText(signatureText, {
            x: 50,
            y: 105, // Adjust this value to position the signature properly
            size: 8,
            font: await pdfDoc.embedFont('Helvetica'), // Custom font type (e.g., Helvetica)
            color: rgb(0, 0, 0), // Black color
            maxWidth: lastPage.getWidth() - 100, // Ensure the text fits within the page
            lineHeight: 11 // Adjust line height to fit text
        });

        // Save the modified PDF with the signature added
        const modifiedPdfBytes = await pdfDoc.save();

        // Send the modified PDF to the client
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${Date.now()}_${Key}"`,
            'Content-Length': modifiedPdfBytes.length
        });
        res.status(200).send(Buffer.from(modifiedPdfBytes));

        console.log('Signature added to PDF and sent to client successfully!');
    } catch (error) {
        console.error('Error adding signature to PDF:', error);
        res.status(500).send({ error: 'Error adding signature to PDF' });
    }
};