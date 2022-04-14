const express = require("express");

const router = express.Router();

const controller = require("../controllers/mainBanner");
const uploadStorage = require("../middleware/uploadBanner");

router.post(
    "/insertBanner",
    uploadStorage.fields([{name: "mainBannerImages", maxCount: 18}]),
    controller.insertBanner
);

router.get("/getBanner", controller.getBanner);

module.exports = router;
