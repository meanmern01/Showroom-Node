const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const authToken = req.cookies.authtoken;
    console.log("authToken");
    if (!authToken) return res.status(401).send("Access denied!");

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        res.send("sucess");
    } catch (error) {
        res.status(400).send("Token is not valid!");
    }
};

const verifyJWT = async (req, res, next) => {
    const token = req.headers["x-access-token"];

    console.log("token : ", token);
    if (!token) {
        res.status(401).send("Access denied!");
    } else {
        try {
            const verified = jwt.verify(token, process.env.TOKEN_SECRET);
            req.user = verified;
            res.status(200).send("sucess");
        } catch (error) {
            res.status(400).send("Token is not valid!");
        }
        // jwt.verify(token, "jwtSecret", (err, decoded) => {
        //   if (err) {
        //     res
        //       .status(400)
        //       .send({ auth: false, message: "failed to authenticate" });
        //     console.log("token failed");
        //   } else {
        //     // req.userId = decoded.id;
        //     // req.email = decoded.email;
        //     // console.log("token success : ", req.email)
        //     // next();
        //     res.status(200).send("sucess");
        //   }
        // });
    }
    //   try {
    //     const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    //     req.user = verified;
    //     res.send("sucess");
    //   } catch (error) {
    //     res.status(400).send("Token is not valid!");
    //   }
};

module.exports = {verifyJWT};
