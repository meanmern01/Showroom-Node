const express = require("express");

const router = express.Router();

const controller = require("../controllers/model-cut");
const uploadModelCut = require("../middleware/uploadModelCut");

module.exports = router;

router.post(
    "/storeModalCut",
    uploadModelCut.array("images", 18),
    controller.storeModalCut
);
router.post(
    "/editModelCut",
    uploadModelCut.array("images", 18),
    controller.editModelCut
);
router.post(
    "/editModelSequence",
    uploadModelCut.array("images"),
    controller.editModelSequence
);
router.post("/getFilterModal", controller.getFilterModal);
router.get("/getSingleModelCut", controller.getSingleModelCut);
router.get("/getAllModalCut", controller.getAllModalCut);
router.get("/getModelCutBySeason", controller.getModelCutBySeason);
router.get("/getActivatedModelCut", controller.getActivatedModelCut);
router.post("/deleteModel", controller.deleteModel);
