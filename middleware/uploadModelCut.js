const multer = require('multer');
const fs = require('fs');
const path = require('path');

const modalCutStorage = multer.diskStorage({
    destination: async function(req,file,cb) {
        const modalCutDir = path.join(__dirname, '..','public', 'models');
        if(fs.existsSync(modalCutDir)) {
            cb(null, modalCutDir);
        }
        else {
            fs.mkdirSync(modalCutDir, {recursive:true})
            cb(null, modalCutDir);
        }
    },
    filename:async function(req,file,cb){
        const image = Date.now() + '_' + Math.random().toString(36).substring(2, 15) + '.' + file.mimetype.split('/')[1];
        cb(null,image)
    }

})

const uploadModelCut = multer({
    storage: modalCutStorage,
    fileFilter: (req,file, cb) => {
        const fileType = /jpeg|jpg|png/;
        const extension = file.originalname.substring(file.originalname.lastIndexOf('.') + 1);
        const mimetype = fileType.test(file.mimetype);

        if(mimetype && extension){
            return cb(null,true);
        }else{
            cb('Error:you can upload only Image file');
        }
    }
})

module.exports = uploadModelCut
