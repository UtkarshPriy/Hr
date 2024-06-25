

const addSignatureToS3Document = async (req, res) => {
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
            y: 50, // Adjust this value to position the signature properly
            size: 12,
            color: rgb(0, 0, 0), // Black color
        });

        // Save the modified PDF with the signature added
        const modifiedPdfBytes = await pdfDoc.save();

        // Send the modified PDF to the client
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${Date.now()}_${Key}.pdf"`,
            'Content-Length': modifiedPdfBytes.length
        });
        res.status(200).send(modifiedPdfBytes);

        console.log('Signature added to PDF and sent to client successfully!');
    } catch (error) {
        console.error('Error adding signature to PDF:', error);
        res.status(500).send({ error: 'Error adding signature to PDF' });
    }
};