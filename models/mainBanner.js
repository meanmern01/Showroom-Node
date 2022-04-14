const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
    {
        palletNo: Number,
        headlight: String,
        activation: Boolean,
        mainBannerImages: Array,
    },
    {timestamps: {createdAt: "created_at", updatedAt: "updated_at"}},
    {
        collection: "banner",
    }
);

const banner = mongoose.model("banner", bannerSchema);
module.exports = banner;
