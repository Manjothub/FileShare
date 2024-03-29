const router = require('express').Router();
const { error } = require('console');
const multer = require('multer');
const path = require('path');
const File =  require('../models/file');
const {v4 : uuid4 } = require('uuid');
const sendmail = require('../services/emailService');
const { read } = require('fs');


let storage = multer.diskStorage({
    destination:(req,file,cb)=>cb(null,'uploads/'),
    filename:(req,file,cb)=>{
        const uniqueName = `${Date.now()}-${Math.round(Math.random()*1E9)}${path.extname(file.originalname)}`;
        cb(null,uniqueName);
    }
})

let upload = multer({
    storage,
    limit:{ fileSize: 100000 * 100 },
}).single('myfile');

router.post('/',(req,res)=>{
    
    
    // Store File
    upload(req,res,async(err)=>{
        // Validate Request
        if (!req.file){
            return res.json({ error:'File not Found Please Try Again' })
        }
        
        if(err){
            return res.status(500).send({ error:err.message})
        }
        // Database Store
        const file = new File({
            filename: req.file.filename,
            uuid: uuid4(),
            path: req.file.path,
            size: req.file.size
        });

        const response = await file.save();
        return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}`});

    })
});

router.post('/send',async (req,res)=>{
    // validate request
    const { uuid , emailTo, emailFrom } = req.body;

    if(!uuid || !emailTo || !emailFrom ){
        return res.status(442).send({error: 'All Fields are Required'});
    }
    // get data from database
    const file = await File.findOne({ uuid: uuid });
    if(file.sender){
        return res.status(442).send({error: 'Email Already Sent'});
    }
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();

    // Send email
    sendmail({
        from :emailFrom,
        to : emailTo,
        subject : 'ShareIn File Sharing',
        text: `${emailFrom} shared  a file with you `,
        html : require('../services/emailTemplate')({
            emailFrom:emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size: parseInt(file.size/1000) + 'KB',
            expires: '24 Hours'
        })
    });
    return res.send({ success: true});
});

module.exports = router;