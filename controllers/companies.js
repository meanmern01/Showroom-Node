const router = require("express").Router();
const Company = require("../models/Company");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

// Send an email to admin for review
// test.dds0001@gmail.com -> Use this email for testing
const smtpTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_PASSWORD,
    },
});

// Signup--------------------------------------------------------------------------------
const signup = async (req, res) => {
    // Check if the email already exists
    const companyEmailAlreadyExists = await Company.findOne({
        companyEmail: req.body.companyEmail,
    });
    if (companyEmailAlreadyExists) {
        return res.status(409).json("This email already exists");
    }

    const newCompany = new Company({
        company: req.body.company,
        companyEmail: req.body.companyEmail,
        name: req.body.name,
        brands: req.body.brands,
    });

    try {
        const savedCompany = await newCompany.save();
        const milliSeconsPerDay = 24 * 60 * 60 * 1000; //86400000;
        const authToken = jwt.sign(
            {_id: savedCompany._id},
            process.env.TOKEN_SECRET,
            {
                expiresIn: milliSeconsPerDay, //Expires in 24 hours
            }
        );

        // res.cookie("authtoken", authToken).status(200).json(authToken);
        res.json({
            code: 200,
            success: true,
            authToken: authToken,
            data: savedCompany,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
};

// Login--------------------------------------------------------------------------------
const login1 = async (req, res) => {
    // Check if companyEmail exists
    const company = await Company.findOne({
        companyEmail: req.body.companyEmail,
    });
    if (!company) {
        return res
            .status(204)
            .json(
                "It seems your account has not been registered yet. Please sign up"
            );
    }

    // Check if the password is valid
    // const validPassword = await bcrypt.compare(
    //   req.body.password,
    //   company.password
    // );

    // Just for testing purpose, other than <<<----------!important
    // need to use above code which includes bcrypt
    const companyWithValidPassword = await Company.findOne(
        {
            companyEmail: req.body.companyEmail,
            password: req.body.password,
        },
        {password: 0}
    );

    if (!companyWithValidPassword) {
        return res.status(401).json("Email or Password invalid!");
    }

    const milliSeconsPerDay = 24 * 60 * 60 * 1000; //86400000;
    const authToken = jwt.sign(
        {_id: companyWithValidPassword._id},
        process.env.TOKEN_SECRET,
        {
            expiresIn: milliSeconsPerDay, //Expires in 24 hours
        }
    );

    res.cookie("authtoken", authToken)
        .status(200)
        .json({authToken, company: companyWithValidPassword});
};

// Login--------------------------------------------------------------------------------
const login = async (req, res) => {
    console.log("login req.body.. ", req.body);

    if (req.body.type && req.body.type === "admin") {
        const company = await Company.findOne({
            companyEmail: req.body.companyEmail,
            type: "admin",
        });
        if (!company) {
            res.json({
                code: 204,
                success: false,
                message:
                    "It seems your account has not been registered yet. Please sign up",
            });
        } else {
            bcrypt.compare(
                req.body.password,
                company.password,
                function (err, isMatch) {
                    if (err) {
                        res.status(500).json({
                            message: "Something went wrong. Please try again!",
                            success: false,
                        });
                    } else {
                        console.log("Match=", isMatch);
                        if (isMatch) {
                            const milliSeconsPerDay = 24 * 60 * 60 * 1000; //86400000;
                            const authToken = jwt.sign(
                                {_id: company._id},
                                process.env.TOKEN_SECRET,
                                {
                                    expiresIn: milliSeconsPerDay, //Expires in 24 hours
                                }
                            );

                            res.json({
                                code: 200,
                                success: true,
                                authToken: authToken,
                                data: company,
                            });
                        } else {
                            res.json({
                                code: 500,
                                message:
                                    "Please check your email address or password again",
                                success: false,
                            });
                        }
                    }
                }
            );
        }
    } else {
        const company = await Company.findOne({
            companyEmail: req.body.companyEmail,
        });
        if (!company) {
            return res.status(204).json({
                message:
                    "It seems your account has not been registered yet. Please sign up",
            });
        } else {
            bcrypt.compare(
                req.body.password,
                company.password,
                function (err, isMatch) {
                    if (err) {
                        res.status(500).json({
                            message: "Something went wrong. Please try again!",
                            success: false,
                        });
                    } else {
                        if (isMatch) {
                            const milliSeconsPerDay = 24 * 60 * 60 * 1000; //86400000;
                            const authToken = jwt.sign(
                                {_id: company._id},
                                process.env.TOKEN_SECRET,
                                {
                                    expiresIn: milliSeconsPerDay, //Expires in 24 hours
                                }
                            );

                            res.json({
                                code: 200,
                                success: true,
                                authToken: authToken,
                                data: company,
                            });
                        } else {
                            res.json({
                                code: 500,
                                message:
                                    "Please check your email address or password again",
                                success: false,
                            });
                        }
                    }
                }
            );
        }
    }
};

// Change password---------------------------------------------
const changedPassword = async (req, res) => {
    console.log("changed psw ", req.body, req.user);

    const foundUser = await Company.findOne({_id: req.user._id}).lean().exec();

    if (foundUser) {
        Company.findByIdAndUpdate(
            {_id: foundUser._id},
            {
                password: bcrypt.hashSync(req.body.password),
            },
            {new: true},
            (err, newRecord) => {
                if (err) {
                    res.json({
                        code: 500,
                        success: false,
                        message: "Error while updating record",
                    });
                } else {
                    res.json({
                        code: 200,
                        success: true,
                        data: newRecord,
                    });
                }
            }
        );
    } else {
        res.json({
            code: 404,
            success: false,
            message: "No such user found!",
        });
    }
};

// Update company's represnetative status i.e. user's status
const changeStatus = async (req, res) => {
    console.log("change status API called ", req.body, req.user);

    const foundUser = await Company.findOne({_id: req.user._id}).lean().exec();

    if (foundUser) {
        Company.findByIdAndUpdate(
            {_id: req.body.userId},
            {
                status: req.body.status,
            },
            {new: true},
            (err, newRecord) => {
                if (err) {
                    res.json({
                        code: 500,
                        success: false,
                        message: "Error while updating record",
                    });
                } else {
                    if (
                        newRecord.status.toLowerCase() ===
                            "approved".toLowerCase() ||
                        newRecord.status.toLowerCase() ===
                            "allowed".toLowerCase()
                    ) {
                        function generatePassword() {
                            let password = "";
                            const string =
                                "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                                "abcdefghijklmnopqrstuvwxyz0123456789@#$!_";

                            for (i = 1; i <= 8; i++) {
                                const char = Math.floor(
                                    Math.random() * string.length + 1
                                );

                                password += string.charAt(char);
                            }

                            return password;
                        }
                        let newPassword = generatePassword();
                        console.log("new psw.... ", newPassword);
                        const data = {
                            to: foundUser.companyEmail,
                            from: process.env.GMAIL_ADDRESS,
                            // cc: mailList,
                            subject: "New Password",
                            html: `<b>Please note this following password for the login:</b> <br/> Your password: ${newPassword}`,
                        };

                        smtpTransport.sendMail(data, (error, info) => {
                            console.log("error or success ", error, info);
                            Company.findByIdAndUpdate(
                                {_id: foundUser._id},
                                {
                                    password: bcrypt.hashSync(newPassword),
                                },
                                {new: true},
                                (err, newRecord) => {
                                    if (err) {
                                        res.json({
                                            code: 500,
                                            success: false,
                                            message:
                                                "Error while updating record",
                                        });
                                    } else {
                                        res.json({
                                            code: 200,
                                            success: true,
                                            data: newRecord,
                                        });
                                    }
                                }
                            );
                        });
                    }
                    res.json({
                        code: 200,
                        success: true,
                        data: newRecord,
                    });
                }
            }
        );
    } else {
        res.json({
            code: 404,
            success: false,
            message: "No such user found!",
        });
    }
};

module.exports = {signup, login, changedPassword, changeStatus};
