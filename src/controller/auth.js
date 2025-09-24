const {
	hashPassword,
	generateToken,
	saveToken,
	comparePassord,
	sendEmail,
	siteName,
} = require("../helper/utils");
const { Reset, Oauth } = require("../model");
const User = require("../model/userModel");
const path = require("path");
const fs = require("fs");

let registerEmail = fs.readFileSync(
	path.join(__dirname, "../assets/emails/signupEmail.html"),
	"utf-8"
);

let forgottenEmail = fs.readFileSync(
	path.join(__dirname, "../assets/emails/forgotenpassword.html"),
	"utf-8"
);

let resetPassEmail = fs.readFileSync(
	path.join(__dirname, "../assets/emails/passwordRest.html"),
	"utf-8"
);

let welcome = fs.readFileSync(
	path.join(__dirname, "../assets/emails/welcome.html"),
	"utf-8"
);
const register = async (req, res) => {
    console.log("income signup controller");

	try {
		const payload = req.body;
		if (!payload)
			return res
				.status(400)
				.json({ status: false, message: "Invalid payload" });
		const emailExist = await User.findOne({ email: payload.email });
		if (emailExist)
			return res
				.status(409)
				.json({ status: false, message: "email is already registered" });
		const encrypedPassword = await hashPassword(payload.password);
		const userData = {};
		userData.firstname = payload.firstname;
		userData.lastname = payload.lastname;
		userData.password = encrypedPassword;
		userData.email = payload.email;

		const user = await User.create(userData);
		const userDetails = {};
		(userDetails.email = user.email),
			(userDetails.lastname = user.lastname),
			(userDetails.firstname = user.firstname),
			(userDetails._id = user._id),
			(userDetails.verified = user.verfied);

		const expires = new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000);
		if (user) {
			const token = generateToken(userDetails);
			await saveToken(token, userDetails._id, expires, true);
			const otp = Math.floor(100000 + Math.random() * 900000).toString();
			const expire_in = new Date(Date.now() + 60 * 60 * 1000);
			await Reset.create({
				otp,
				expire_in,
				email: userDetails.email,
			});
			const signupEmail = registerEmail
				.replace("{{code}}", otp)
				.replace("{{name}}", userDetails.firstname)
				.replaceAll("{{siteName}}", siteName);
			await sendEmail(userDetails.email, "Verify account", signupEmail);
			return res.status(200).json({
				status: true,
				message: "user created, chek email for verification",
				data: { userDetails, token },
			});
		}
		return res.status(500).json({
			status: false,
			message: "User could not be created",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: false,
			message: error.message || "Internal server error",
		});
	}
};

const login = async (req, res) => {
    console.log("income login controller")
	try {
		const payload = req.body;
		if (!payload)
			return res
				.status(400)
				.json({ status: false, message: "Invalid payload" });
		const user = await User.findOne({ email: payload.email });
		if (!user)
			return res
				.status(400)
				.json({ status: false, message: "Email is not registered" });
		const auth = await comparePassord(payload.password, user.password);
		if (!auth)
			return res
				.status(403)
				.json({ status: false, message: "invalid password" });
		const userDetails = {};
		(userDetails.email = user.email),
			(userDetails.lastname = user.lastname),
			(userDetails.firstname = user.firstname),
			(userDetails._id = user._id),
			(userDetails.verified = user.verfied);
		const expires = new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000);
		const token = generateToken(userDetails);
		const savedToken = await saveToken(token, userDetails._id, expires, true);
		if (savedToken) console.log("token saved");
		return res.status(200).json({
			status: true,
			message: "Login successful",
			data: { userDetails, token },
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message || "Internal server error",
		});
	}
};

const logout = async (req, res) => {
	try {
		const userId = req.user_id;
		const user = await User.findOne({ _id: userId });
		if (!user)
			return res
				.status(403)
				.json({ status: false, message: "cannot logout an invalid user" });
		const deleteToken = await Oauth.findOneAndDelete({ user_id: userId });
		if (!deleteToken)
			return res
				.status(500)
				.json({ status: false, message: "could not logout user" });
		return res.status(200).json({
			status: true,
			message: "Logout successful",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message || "Internal server error",
		});
	}
};

const verifyEmailCode = async (req, res) => {
	try {
		const { email, otp } = req.body;
		if (!email || !otp)
			return res
				.status(400)
				.json({ status: false, message: "Invalid payload" });
		const validOTP = await Reset.findOne({ email, otp });
		const user = await User.findOne({ email });
		if (user.verfied)
			return res
				.status(203)
				.json({ status: true, message: "User ia already verified" });
		if (!validOTP)
			return res.status(203).json({ status: true, message: "invalid otp" });
		if (Date.now() > validOTP.expire_in)
			return res.status(203).json({ status: true, message: "OTP expired" });
		await User.findOneAndUpdate({ email }, { $set: { verfied: true } });
		await Reset.deleteMany({ email });
		const welcomeEmail = welcome
			.replace("{{name}}", user.firstname)
			.replaceAll("{{siteName}}", siteName);
		await sendEmail(user.email, "Welcome onBoard", welcomeEmail);
		return res
			.status(200)
			.json({ status: true, message: "User Verification successful" });
	} catch (error) {
		return res.status(500).json({
			status: false,
			message: error.message || "Internal server error",
		});
	}
};
const forgotPassword = async (req, res) => {
	try {
		const { email, password, otp } = req.body;
		if ((email, !password, !otp)) {
			const emailExist = await User.findOne({ email });
			if (!emailExist)
				return res.status(400).json({
					status: false,
					message: "A otp was sent to the email provided",
				});
			const otp = Math.floor(100000 + Math.random() * 999999);
			const expire_in = new Date(Date.now() + 30 * 60 * 1000); //  expires in 30 mins
			await Reset.create({ email, otp, expire_in });
			const forgotEmail = forgottenEmail
				.replace("{{code}}", otp)
				.replace("{{name}}", emailExist.firstname)
				.replaceAll("{{siteName}}", siteName);
			await sendEmail(emailExist.email, "Forgotten Password", forgotEmail);
			return res.status(200).json({
				status: true,
				message: "An otp was sent to the provided email",
			});
		}
		if ((email, otp, !password)) {
			const validOtp = await Reset.findOne({ email, otp });
			if (!validOtp)
				return res.status(401).json({ status: false, message: "Invalid otp" });
			if (Date.now() > validOtp.expire_in)
				return res.status(401).json({ status: false, message: "Expired otp" });
			return res
				.status(200)
				.json({ status: true, message: "otp verified, setp 2" });
		}
		if ((email, otp, password)) {
			const validOtp = await Reset.findOne({ email, otp });
			if (!validOtp)
				return res.status(401).json({ status: false, message: "Inalid otp" });
			if (Date.now > validOtp.expire_in)
				return res.status(401).json({ status: false, message: "Expired otp" });
			const encryptedPassword = await hashPassword(password);
			const updateData = {};
			updateData.email = email;
			updateData.password = encryptedPassword;
			const updated = await User.findOneAndUpdate(
				{ email: updateData.email },
				{ $set: updateData }
			);
			const resetEmail = resetPassEmail
				.replace("{{name}}", updated.firstname)
				.replaceAll("{{siteName}}", siteName);
			await sendEmail(updated.email, "Password reset sucessful ", resetEmail);
			await Reset.deleteMany({ email });
			if (updated)
				return res
					.status(200)
					.json({ status: true, message: "password reset successful" });
			else
				return res
					.status(500)
					.json({ status: false, message: "Colud not update user password" });
		} else {
			return res.status(400).json({
				status: false,
				message: "Invalid request",
			});
		}
	} catch (error) {
		return res.status(500).json({
			status: false,
			message: error.message || "Internal server error",
		});
	}
};

module.exports = {
	register,
	login,
	logout,
	verifyEmailCode,
	forgotPassword,
};
