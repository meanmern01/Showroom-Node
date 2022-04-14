const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

// autoIncrement.initialize(mongoose.connection);
const newSchema = new mongoose.Schema(
    {
        modalName: String,
        brandId: String,
        seasonId: String,
        activation: Boolean,
        productId: Array,
        images: Array,
        number: Number,
        index: Number,
    },
    {timestamps: {createdAt: "created_at", updatedAt: "updated_at"}},
    {
        collection: "modal-cut",
    }
);
// newSchema.plugin(autoIncrement.plugin, {
//     model: "modal-cut",
//     field: "index",
//     startAt: 0,
// });
const modalCut = mongoose.model("modal-cut", newSchema);
module.exports = modalCut;
