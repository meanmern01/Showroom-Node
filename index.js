if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const autoIncrement = require("mongoose-auto-increment");

// Import Routes
const authRoute = require("./routes/company");
const bannerRoute = require("./routes/mainBanner");
const modelRoute = require("./routes/model-cut");
const {verifyJWT} = require("./middleware/verify");

// App Initialization
const app = express();

// Connect to db

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("connected to db");
        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => {
            console.log(`app is listening to port ${PORT}`);
        });
    })
    .catch((error) => console.log(error));

// mongoose.set("debug", true);

// Middlewares

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Route Middlewares
app.use("/api/company", authRoute);
app.use("/api/banner", bannerRoute);
app.use("/api/model-cut", modelRoute);
app.get("/verify", verifyJWT);

app.use("*", (req, res) => {
    console.log("No API found");
    return res.status(400).send("No API found");
});

// 404 Not Found
app.use((req, res) => {
    res.status(200).send("It's working");
});
