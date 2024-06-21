import path from 'path';
import AWS from 'aws-sdk';
import fs from 'fs';
import multer from 'multer';
import flash from 'connect-flash';


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
    // console.log(fileStream);

    s3.upload(params, (err, data) => {
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
        // Successful upload
        req.flash('message', 'File Uploaded');
        res.render('upload_doc_by_owner',{ message: req.flash('message') }); // Redirect to your desired route
    });
};
