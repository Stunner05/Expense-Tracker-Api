const { Expenses, ExpenseCategory } = require("../model");

const expenseGet = async (req, res) => {
	try {
		const userId = req.user_id;
		let { limit, page } = req.params;
		const { startDate, endDate, status, category, name } = req.query;
		limit = parseInt(limit);
		page = parseInt(page);
		const offset = (page - 1) * limit;
		const transactionFilter = {};
		transactionFilter.user = userId;
		const transactionFilters = { user: userId };
		if (category) transactionFilter.category = category;
		if (name) transactionFilter.name = name;
		if (status) transactionFilter.status = status;
		const expenseRecords = await Expenses.find(transactionFilter)
			.limit(limit)
			.skip(offset)
			.populate({ path: "category", select: "name" })
			.populate({ path: "user", select: "firstname" });
		const count = expenseRecords.length;

		console.log("transaction filter", transactionFilter);
		const totalCount = await Expenses.countDocuments(transactionFilter);
		total = 0;
		expenseRecords.forEach((expense) => {
			total += expense.amount;
		});
		const totalAmount = await Expenses.aggregate([
			{ $match: { amount: { $gte: 0 } } }, // 1
			{
				$group: {
					_id: null,
					totalAmount: { $sum: "$amount" }, // 4
				},
			},
		]);
		const totalExpenseAmount = totalAmount[0]?.totalAmount || 0;
				console.log("🚀 ~ expenseGet ~ totalCount:", totalCount)
		return res.status(200).json({
			status: true,
			message: "Expense fetched",
			data: {
				count,
				total,
				totalCount,
				expenseRecord: expenseRecords || [],
				totalExpenseAmount,
			},
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message || "Internal Server Error",
		});
	}
};

const expensesCategoryGet = async (req, res) => {
	try {
		const categories = await ExpenseCategory.find();
		return res.status(200).json({
			status: true,
			message: "Expenses Category fetched",
			data: categories || [],
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message || "Internal Server Error",
		});
	}
};
const expenseIdGet = async (req, res) => {
	try {
		const userId = req.user_id;
		const { id } = req.params;
		const expenseRecord = await Expenses.findById(id)
			.populate({ path: "category", select: "name" })
			.populate({ path: "user", select: "firstname" });
		if (!expenseRecord) return res.status(200).json({ status: true, data: {} });
		const expenseUser = expenseRecord?.user?._id;
		if (expenseUser != userId)
			return res
				.status(403)
				.json({ status: false, message: "unauthorized access" });
		return res.status(200).json({
			status: true,
			message: "Expenses details fetched",
			data: expenseRecord,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message || "Internal Server Error",
		});
	}
};
const expensePost = async (req, res) => {
	try {
		const userId = req.user_id;
		const { name, status, amount, category, description } = req.body;
		if (!name || !status || !amount || !category || !description)
			return res
				.status(400)
				.json({ status: false, message: "Invalid payload" });
		const expense = await await Expenses.create({
			name,
			status,
			amount,
			category,
			description,
			user: userId,
		});
		if (expense)
			return res
				.status(200)
				.json({ status: true, message: "Expense added successsfully" });
		else
			return res
				.status(203)
				.json({ status: true, message: "could not add expense details" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message || "Internal Server Error",
		});
	}
};
const expensePut = async (req, res) => {
	console.log(req.body)
	console.log("headers", req.headers)
	try {
		const userId = req.user_id;
		const payload = req.body;
		const { id } = req.params;
		const expenseExist = await Expenses.findOne({ user: userId, _id: id });
		if (!expenseExist)
			return res.status(203).json({
				status: true,
				message: "no expense record found to be Updated",
				data: {},
			});
		const updateExpense = await Expenses.findByIdAndUpdate(id, { ...payload });
		if (updateExpense)
			return res
				.status(200)
				.json({ status: true, message: "Expense record Updated" });
		else
			return res
				.status(203)
				.json({ status: true, message: "could not update expense record" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message || "Internal server error",
		});
	}
};
const expenseDelete = async (req, res) => {
	try {
		const userId = req.user_id;
		const { id } = req.params;
		const expenseExist = await Expenses.findOne({ user: userId, _id: id });
		if (!expenseExist)
			return res.status(203).json({
				status: true,
				message: "no expense record found to be deleted",
				data: {},
			});
		const deleteExpense = await Expenses.findByIdAndDelete(id);
		if (deleteExpense)
			return res
				.status(200)
				.json({ status: true, message: "Expense record deleted" });
		else
			return res
				.status(203)
				.json({ status: false, message: "could not delete Expense record" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message || "Internal server Error",
		});
	}
};
module.exports = {
	expenseGet,
	expensesCategoryGet,
	expenseIdGet,
	expensePost,
	expensePut,
	expenseDelete,
};
