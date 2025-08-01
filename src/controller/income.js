const { default: mongoose } = require("mongoose");
const { Income } = require("../model");

const incomeGet = async (req, res) => {
	try {
		const userId = req.user_id;
		let { limit, page } = req.params;
		const { startDate, endDate, source, name, status } = req.query;
		limit = parseInt(limit);
		page = parseInt(page);
		const offset = (page - 1) * limit;
		const transactionFilter = {};
		transactionFilter.user = userId;
		// if(startDate) transactionFilter.startDate < startDate
		// if(endDate) transactionFilter.endDate = endDate
		if (source) transactionFilter.source = source;
		if (name) transactionFilter.name = name;
		if (status) transactionFilter.status = status;
		const incomeRecords = await Income.find(transactionFilter)
			.limit(limit)
			.skip(offset)
			.populate({ path: "user", select: "firstname" });
		const totalCount = await Income.countDocuments(transactionFilter);
		const count = incomeRecords.length;
		total = 0;
		incomeRecords.forEach((income) => {
			total += income.amount;
		});
		const totalAmount = await Income.aggregate([
			{ $match: { amount: { $gte: 0 } } }, // 1
			{
				$group: {
					_id: null,
					totalAmount: { $sum: "$amount" },
				},
			},
		]);
		const totalIncomeAmount = totalAmount[0]?.totalAmount || 0;
		if (incomeRecords)
			return res.status(200).json({
				status: true,
				message: "income fetched",
				data: {
					count,
					total,
					totalCount,
					incomeRecord: incomeRecords || [],
					totalIncomeAmount,
				},
			});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message || "Internal server Error",
		});
	}
};
const incomeIdGet = async (req, res) => {
	try {
		const userId = req.user_id;
		const { incomeId } = req.params;
		const incomeRecord = await Income.findById(incomeId).populate({
			path: "user",
			select: "firstname",
		});
		if (!incomeRecord)
			return res
				.status(203)
				.json({ status: true, message: "no record found", data: {} });
		const incomeUser = incomeRecord.user._id;
		if (incomeUser != userId)
			return res
				.status(403)
				.json({ status: false, message: "unauthorized access" });
		return res.status(200).json({
			status: true,
			message: "income details fetched",
			data: incomeRecord,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message || "Internal server Error",
		});
	}
};

const incomePost = async (req, res) => {
	try {
		const userId = req.user_id;
		const { name, status, amount, source, description } = req.body;
		if (!name || !status || !amount || !source || !description)
			return res
				.status(400)
				.json({ status: false, message: "Invalid payload" });
		const income = await Income.create({
			name,
			status,
			amount,
			source,
			description,
			user: userId,
		});
		if (income)
			return res.status(200).json({
				status: true,
				message: "Income added successsfully",
				data: income,
			});
		else
			return res.status(203).json({
				status: true,
				message: "could not add income details",
				data: {},
			});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message || "Internal server Error",
		});
	}
};
const incomePut = async (req, res) => {
	try {
		const userId = req.user_id;
		const payload = req.body;
		const { incomeId } = req.params;
		const incomeExist = await Income.findOne({ user: userId, _id: incomeId });
		if (!incomeExist)
			return res.status(203).json({
				status: true,
				message: "no income record found to be updated",
				data: {},
			});
		const updateIncome = await Income.findByIdAndUpdate(incomeId, {
			...payload,
		});
		if (updateIncome)
			return res.status(200).json({
				status: true,
				message: "Income record Updated",
				data: updateIncome,
			});
		else
			return res.status(203).json({
				status: true,
				message: "could not update income record",
				data: {},
			});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message || "Internal server Error",
		});
	}
};

const incomeDelete = async (req, res) => {
	try {
		const userId = req.user_id;
		const { incomeId } = req.params;
		const incomeExist = await Income.findOne({ user: userId, _id: incomeId });
		if (!incomeExist)
			return res
				.status(203)
				.json({ status: true, message: "no income record found", data: {} });
		const deleteIncome = await Income.findByIdAndDelete(incomeId);
		if (deleteIncome)
			return res
				.status(200)
				.json({ status: true, message: "Income record deleted" });
		else
			return res
				.status(203)
				.json({ status: false, message: "could not delete income record" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message || "Internal server Error",
		});
	}
};

module.exports = {
	incomeGet,
	incomeIdGet,
	incomePost,
	incomeDelete,
	incomePut,
};
