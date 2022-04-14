const modalCut = require("../models/model-cut");
const fs = require("fs");
const moment = require("moment");
const today = moment().startOf("day");

const storeModalCut = async (req, res) => {
    let imageArray = [];
    if (req.files) {
        req.files.forEach((singleFile) => {
            let imagePath =
                process.env.NODE_ENV === "development"
                    ? "http://localhost:8080/models/" +
                      singleFile.filename.replace(/\s/g, "")
                    : `${process.env.PATH}/models/` +
                      singleFile.filename.replace(/\s/g, "");
            imageArray.push(imagePath);
        });
    }

    try {
        let newModal = new modalCut();

        if (req.body.productId) {
            if (typeof req.body.productId == "string") {
                newModal.productId.push(req.body.productId);
            } else {
                req.body.productId.forEach((item) => {
                    newModal.productId.push(item);
                });
            }
        }

        var countQuery = modalCut.count();
        await countQuery.exec((err, count) => {
            if (err) {
                console.log("err", err);
            } else {
                if (count < 1) {
                    newModal.index = 1;
                } else {
                    newModal.index = count + 1;
                }
                newModal.modalName = req.body.modalName;
                newModal.brandId = req.body.brand;
                newModal.seasonId = req.body.season;
                newModal.activation = req.body.activation;
                newModal.number = req.body.number;
                newModal.images = imageArray;

                const storedModel = newModal.save();
                if (storedModel) {
                    res.json({
                        code: 200,
                        success: true,
                        message: "Data insert successfully",
                    });
                } else {
                    res.json({
                        code: 500,
                        success: false,
                        message: "Error while storing modal cut details",
                    });
                }
            }
        });
    } catch (e) {
        res.json({
            code: 500,
            success: false,
            message: "Error while storing modal cut details",
        });
    }
};

const editModelCut = async (req, res) => {
    let products = [];
    try {
        let imageArray = [];
        let brandSeasons = {};
        if (req.files) {
            req.files.forEach((singleFile) => {
                let imagePath =
                    process.env.NODE_ENV === "development"
                        ? "http://localhost:8080/models/" +
                          singleFile.filename.replace(/\s/g, "")
                        : `${process.env.PATH}/models/` +
                          singleFile.filename.replace(/\s/g, "");
                imageArray.push(imagePath);
            });
        }
        if (req.body.productId) {
            if (typeof req.body.productId == "string") {
                products.push(req.body.productId);
            } else {
                req.body.productId.forEach((item) => {
                    products.push(item);
                });
            }
        }
        let brandInfo = await brand.findOne({_id: req.body.brand});
        if (brandInfo) {
            brandSeasons = brandInfo.seasons.find(
                ({_id}) => req.body.season == _id
            );
            if (brandSeasons) {
                await modalCut.findOneAndUpdate(
                    {_id: req.body.id},
                    {
                        images: imageArray,
                        modalName: req.body.modalName,
                        brandId: brandInfo._id,
                        seasonId: brandSeasons._id,
                        number: req.body.number,
                        activation: req.body.activation,
                        productId: products,
                    }
                );

                res.json({
                    code: 200,
                    success: true,
                    message: "success",
                });
            } else {
                res.json({
                    code: 422,
                    success: true,
                    message: "Enter valid season",
                });
            }
        }
    } catch (error) {
        res.json({
            code: 500,
            success: true,
            message: "Error while updating model cut data",
        });
    }
};

const editModelSequence = async (req, res) => {
    console.log("------body-----", req.body);
    if (req.body) {
        for (let model of req.body) {
            await modalCut
                .findOneAndUpdate(
                    {_id: model._id},
                    {index: model.index},
                    {new: true}
                )
                .then((result) => {
                    console.log("result : ", result);
                });
        }
        res.json({
            code: 200,
            success: true,
            data: "Sequence changed",
        });
    }
};

const getFilterModal = async (req, res) => {
    var query = {};

    if (req.body.name)
        query.modalName = {$regex: new RegExp(req.body.name, "i")};
    if (req.body.activation)
        query.activation = req.body.activation == "true" ? true : false;
    if (req.body.productId) query.productId = req.body.productId;
    if (req.body.number) query.number = parseInt(req.body.number);
    if (req.body.dates == "Today")
        query.created_at = {
            $gte: today.toDate(),
            $lte: moment(today).endOf("day").toDate(),
        };
    if (req.body.dates == "Yesterday")
        query.created_at = {
            $gte: moment().subtract(2, "days").endOf("day").toDate(),
            $lte: today.toDate(),
        };

    if (req.body.dates == "7 Days")
        query.created_at = {
            $gte: moment().subtract(8, "days").endOf("day").toDate(),
            $lte: today.endOf("day").toDate(),
        };
    if (req.body.dates == "14 Days")
        query.created_at = {
            $gte: moment().subtract(15, "days").endOf("day").toDate(),
            $lte: today.endOf("day").toDate(),
        };

    if (req.body.range)
        query.created_at = {
            $gte: req.body.range[0],
            $lte: req.body.range[1],
        };

    if (req.body.brand) {
        query.brandId = req.body._id;
    }
    if (req.body.season) {
        query.seasonId = req.body._id;
    }

    const filter = await modalCut.find(query).lean().exec();
    let filteredData = [];

    if (filter.length > 0) {
        for (let modelCut of filter) {
            let productList = [];

            const brandInfo = await brand
                .findOne({_id: modelCut.brandId})
                .lean()
                .exec();

            let brandSeasons = brandInfo.seasons.find(
                ({_id}) => modelCut.seasonId == _id
            );
            let products = await product
                .find()
                .where("_id")
                .in(modelCut.productId)
                .exec();

            if (products) {
                for (let product of products) {
                    productList.push(product.productName);
                }
            }

            filteredData.push({
                _id: modelCut._id,
                products: productList,
                images: modelCut.images,
                modalName: modelCut.modalName,
                seasonName: brandSeasons?.seasonName,
                brandName: brandInfo?.brandName,
                number: modelCut.number,
                activation: modelCut.activation,
                created_at: modelCut.created_at.toLocaleDateString("ko-KR"),
                updated_at: modelCut.updated_at.toLocaleDateString("ko-KR"),
            });
        }

        res.json({
            code: 200,
            success: true,
            data: filteredData,
        });
    } else {
        res.json({
            code: 404,
            success: false,
            data: filter,
        });
    }
};

const getAllModalCut = async (req, res) => {
    console.log("----get all model cuts-----");
    let mainData = [];
    let brandSeasons = {};
    const modelCutList = await modalCut.find().lean().exec();

    if (modelCutList.length > 0) {
        for (let modelcut of modelCutList) {
            let productList = [];
            const brandInfo = await brand
                .findOne({_id: modelcut.brandId})
                .lean()
                .exec();
            if (brandInfo) {
                brandSeasons = brandInfo.seasons.find(
                    ({_id}) => modelcut.seasonId == _id
                );
            }
            const products = await product
                .find()
                .where("_id")
                .in(modelcut.productId)
                .exec();
            if (products) {
                for (let product of products) {
                    productList.push(product.productName);
                }
            }
            mainData.push({
                _id: modelcut._id,
                modalName: modelcut.modalName,
                brandName: brandInfo?.brandName,
                seasonName: brandSeasons?.seasonName,
                activation: modelcut.activation,
                products: productList,
                images: modelcut.images,
                created_at: modelcut.created_at.toLocaleDateString("ko-KR"),
                updated_at: modelcut.updated_at.toLocaleDateString("ko-KR"),
            });
        }

        res.json({
            code: 200,
            success: true,
            data: mainData,
        });
    } else {
        res.json({
            code: 404,
            success: false,
            message: "No modelcuts added yet!",
        });
    }
};

const getSingleModelCut = async (req, res) => {
    let mainData = {};
    let productList = [];
    let s = {};
    const modelCutList = await modalCut
        .findOne({_id: req.query.id})
        .lean()
        .exec();
    if (modelCutList) {
        const products = await product
            .find()
            .where("_id")
            .in(modelCutList.productId)
            .exec();
        if (products) {
            for (let product of products) {
                productList.push(product);
            }
        }
        let brandInfo = await brand.findOne({_id: modelCutList.brandId});
        if (brandInfo) {
            s = brandInfo.seasons.find(({_id}) => modelCutList.seasonId == _id);
        }
        mainData = {
            _id: modelCutList._id,
            modalName: modelCutList.modalName,
            brandId: brandInfo?._id,
            seasonId: s?._id,
            number: modelCutList.number,
            activation: modelCutList.activation,
            products: productList,
            images: modelCutList.images,
        };
        res.json({
            code: 200,
            success: true,
            data: mainData,
        });
    } else {
        res.json({
            code: 404,
            success: false,
            message: "No modelcuts added yet!",
        });
    }
};

const getModelCutBySeason = async (req, res) => {
    let modelDetails = [];
    const response = await modalCut
        .find({
            seasonId: req.query.id,
        })
        .sort({index: 1});
    if (response.length > 0) {
        for (let modelcut of response) {
            const result = await product.find({
                _id: {$in: modelcut.productId},
            });

            if (result) {
                modelDetails.push({
                    _id: modelcut._id,
                    images: modelcut.images,
                    modelName: modelcut.modalName,
                    brandId: modelcut.brandId,
                    seasonId: modelcut.seasonId,
                    number: modelcut.number,
                    products: result,
                });
            }
        }
    }
    console.log("modeldetails : ", modelDetails);
    res.json({
        code: 200,
        success: true,
        data: modelDetails,
    });
};

const getActivatedModelCut = async (req, res) => {
    let modelDetails = [];
    const response = await modalCut
        .find({
            seasonId: req.query.id,
            activation: true,
        })
        .sort({index: 1});
    if (response.length > 0) {
        for (let modelcut of response) {
            const result = await product.find({
                _id: {$in: modelcut.productId},
                activation: true,
            });

            if (result) {
                modelDetails.push({
                    _id: modelcut._id,
                    images: modelcut.images,
                    modelName: modelcut.modalName,
                    brandId: modelcut.brandId,
                    seasonId: modelcut.seasonId,
                    number: modelcut.number,
                    products: result,
                });
            }
        }
    }
    console.log("modeldetails : ", modelDetails);
    res.json({
        code: 200,
        success: true,
        data: modelDetails,
    });
};
const deleteModel = async (req, res) => {
    console.log("delete");
    try {
        const modelInfo = await modalCut
            .find()
            .where("_id")
            .in(req.body.id)
            .exec();
        for (let i = 0; i < modelInfo.length; i++) {
            modelInfo[i].images.forEach((item, i) => {
                fs.unlinkSync(`public/models/${item.split("/").pop()}`);
            });
        }

        const modelDelete = await modalCut
            .deleteMany({_id: {$in: req.body.id}})
            .lean()
            .exec();
        if (modelDelete) {
            console.log("delete");
            res.json({
                code: 200,
                success: true,
                message: "Records delete successfully",
            });
        } else {
            console.log("no delete");
            res.json({
                code: 404,
                success: false,
                message: "Not found record",
            });
        }
    } catch (error) {
        console.log("error---", error);
        res.status(422).send({success: false, message: error.message});
    }
};

module.exports = {
    storeModalCut,
    getFilterModal,
    editModelCut,
    editModelSequence,
    getAllModalCut,
    getSingleModelCut,
    getModelCutBySeason,
    getActivatedModelCut,
    deleteModel,
};
