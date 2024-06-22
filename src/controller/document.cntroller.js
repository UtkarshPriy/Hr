import path from 'path';
import AWS from 'aws-sdk';
import fs from 'fs';
import multer from 'multer';
import flash from 'connect-flash';
import Doc from '../model/document.model.js';
import { create } from 'domain';
import jwt from 'jsonwebtoken';
import DocEmployeeRelation from '../model/docEmployeeRelation.model.js';
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
        let newDoc = {
            docName:documentName,
            key:fileKey,
            uploader:owner,
            docURL:fileUrl,
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