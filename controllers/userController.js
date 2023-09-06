const generatetoken = require("../configs/jwtToken");
const User = require("../models/userModel")
const asyncHandler = require("express-async-handler");
const validateMongoDBId = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../configs/refreshtoken");
const crypto = require("crypto")
const jwt = require("jsonwebtoken");
const { sendEmail } = require("./emailController");

const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
        //create new user
        const newUser = new User(req.body);
        await newUser.save();
        res.status(200).json(newUser);

    } else {
        //user already exists
        throw new Error("User Already Exists");

    }
}
)

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email })
    if (findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser?._id)
        const updateuser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken: refreshToken,
            },
            { new: true, }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })

        res.json(
            {
                _id: findUser?.id,
                firstname: findUser?.firstname,
                lastname: findUser?.lastname,
                email: findUser?.email,
                mobile: findUser?.mobile,
                token: generatetoken(findUser?._id),
            }
        )
    } else {
        throw new Error("Invalid Credentials");
    }

})
//handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No refresh Token in Cookie")
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken })
    if (!user) throw new Error("NO Refresh token present in db or matched");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error("There is something wrong with refresh token");
        }
        const accessToken = generatetoken(user?._id);
        res.json({ accessToken });
    })

})

//logout

const logoutUser = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No refresh Token in Cookie")
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken })
    if (!user) {
        res.clearCookie("refreshToken",
            {
                httpOnly: true,
                secure: true,
            })
        return res.sendStatus(204);
    }
    await User.findOneAndUpdate({ refreshToken: refreshToken }, {
        refreshToken: "",
    })
    res.clearCookie("refreshToken",
        {
            httpOnly: true,
            secure: true,
        })
    res.sendStatus(204);
})

//update user

const updateUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDBId(_id);
    try {
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                firstname: req?.body?.firstname,
                lastname: req?.body?.lastname,
                email: req?.body?.email,
                mobile: req?.body?.mobile,
            }, {
            new: true,
        });
        res.json({ updatedUser });
    } catch (error) {
        throw new Error(error)
    }
})

// get all user
const getallUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    } catch (error) {
        throw new Error(error)
    }
})
// get a single user
const getaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const getaUser = await User.findById(id);
        res.json({ getaUser });
    } catch (error) {
        throw new Error(error)
    }
})
//delete a user
const deleteaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        res.json({ deletedUser });
    } catch (error) {
        throw new Error(error)
    }
})

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const block = await User.findByIdAndUpdate(
            id, {
            isBlocked: true,
        },
            { new: true }
        )
        res.json(block);
    } catch (error) {
        throw new Error(error)
    }
})
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const unblock = await User.findByIdAndUpdate(
            id, {
            isBlocked: false,
        },
            { new: true }
        )
        res.json(unblock);
    }
    catch (error) {
        throw new Error(error)
    }

})

const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDBId(_id);
    const user = await User.findById(_id)
    if (password) {
        user.password = password
        const updatedPassword = await user.save()
        res.json(updatedPassword)
    } else {
        res.json(user);
    }

})

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email })
    if (!user) throw new Error("The user with this mail is not found.")
    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi, please follow this link to reset your password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click here</a>`
        const data = {
            to: email,
            text: "Hey user",
            subject: "Forgot Password Link",
            htm: resetURL,
        }
        sendEmail(data);
        res.json(token);
    } catch (error) {
        throw new Error(error)
    }
})

const resetPasword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    const hashtoken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashtoken,
        passwordResetExpires: { $gt: Date.now() },
    })
    if (!user) throw new Error("Token Expired, Please try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json(user);

})
module.exports = {
    createUser,
    loginUser,
    getallUser,
    getaUser,
    deleteaUser,
    updateUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logoutUser,
    updatePassword,
    forgotPasswordToken,
    resetPasword,
}

