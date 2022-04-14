const mongoose = require("mongoose");

// Register a new User
const companySchema = new mongoose.Schema(
  {
    company: {
      type: String,
    },
    companyEmail: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    brands: {
      type: Array,
    },
    password: {
      type: String,
    },
    status: { type: String },
    type: String
  },
  { timestamps: true }
);

const Company = mongoose.model('Company', companySchema);
module.exports = Company;