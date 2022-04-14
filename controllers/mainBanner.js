const banner = require("../models/mainBanner");
const fs = require("fs");
const path = require("path");

/************** Insert banner details ****************/
const insertBanner = async (req, res) => {
  console.log("insert banner req.body", req.body);
  // console.log("FILES", req.files);

  let imageArray = [];

  if (Object.keys(req.files).length !== 0) {
    req.files["mainBannerImages"].forEach((singleFile) => {
      let imagePath =
        process.env.NODE_ENV === "development"
          ? "http://localhost:8080/banner/" +
            singleFile.filename.replace(/\s/g, "")
          : `${process.env.PRODUCTION_URL}/banner/` +
            singleFile.filename.replace(/\s/g, "");
      imageArray.push(imagePath);
    });
  }
  let existingPallet = await banner.findOne({ palletNo: req.body.key });
  if (existingPallet) {
    existingPallet.mainBannerImages.forEach((singleImage) => {
      if (
        fs.existsSync("./public/banner/" + singleImage.split("/banner/")[1])
      ) {
        let filePath = path.join(
          __dirname,
          "..",

          "public",
          "banner",
          singleImage.split("/banner/")[1]
        );

        fs.unlinkSync(filePath);
      }
    });
    let modifiedBanner = await banner.findOneAndUpdate(
      { palletNo: existingPallet.palletNo },
      {
        palletNo: req.body.key,
        headlight: req.body.headlight,
        activation: req.body.activation == "allow" ? true : false,
        mainBannerImages: imageArray,
      }
    );
    if (modifiedBanner) {
      res.json({
        code: 200,
        success: true,
        data: modifiedBanner,
        message: "MODIFIED",
      });
    } else {
      console.log("Error");
      res.json({
        code: 500,
        success: false,
        message: "Something went wrong while saving the record!",
      });
    }
  } else {
    let newBanner = new banner({
      palletNo: req.body.key,
      headlight: req.body.headlight,
      activation: req.body.activation == "allow" ? true : false,
      mainBannerImages: imageArray,
    });

    const savedBanner = await newBanner.save();

    if (savedBanner) {
      res.json({
        code: 200,
        success: true,
        data: savedBanner,
        message: "SAVED",
      });
    } else {
      console.log("Error");
      res.json({
        code: 500,
        success: false,
        message: "Something went wrong while saving the record!",
      });
    }
  }
};

/******************* Get banner details ********************/
const getBanner = async (req, res) => {
  console.log("get banner api called... ", req.query);

  const bannerList = await banner
    .findOne({ palletNo: req.query.palletNo })
    .lean()
    .exec();

  if (bannerList) {
    res.json({
      code: 200,
      success: true,
      data: bannerList,
    });
  } else {
    res.json({
      code: 500,
      success: false,
      message: `Pallet ${req.query.palletNo} not inserted yet`,
    });
  }
};

module.exports = {
  insertBanner,

  getBanner,
};
