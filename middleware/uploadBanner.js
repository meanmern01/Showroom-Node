const multer = require("multer");
const fs = require("fs");
const path = require("path");

/********** BANNER IMAGES ************/
const bannerStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const banneruploadDir = path.join(__dirname, "..", "public", "banner");
        if (fs.existsSync(banneruploadDir)) {
            cb(null, banneruploadDir);
        } else {
            fs.mkdirSync(banneruploadDir, {recursive: true});
            cb(null, banneruploadDir);
        }
    },

    filename: async function (req, file, cb) {
        const image =
            Math.random().toString(36).substring(2, 15) +
            "_" +
            Date.now() +
            "." +
            file.originalname.split(".").reverse()[0];
        console.log("object", image);
        cb(null, image);
    },
});

/********** BANNER IMAGES ************/
const uploadBannerImg = multer({
    storage: bannerStorage,
    fileFilter: function (req, file, cb) {
        const fileType = /jpeg|jpg|png/;
        const extension = file.originalname.substring(
            file.originalname.lastIndexOf(".") + 1
        );
        const mimetype = fileType.test(file.mimetype);

        if (mimetype && extension) {
            return cb(null, true);
        } else {
            cb("Error:you can upload only Image file");
        }
    },
});

module.exports = uploadBannerImg;
