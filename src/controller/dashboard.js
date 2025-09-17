const { json } = require("express");
const { Income, Expenses } = require("../model");

const dashboardGet = async (req, res) => {
	try {
		const userId = req.user_id;
		if (!userId) {
			return res.status(400).json({ error: "User not authenticated" });
		}
		const filteredDate = await Expenses.find({
			user: userId,
			createdAt: {
				$gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
			},
		}).sort({ createdAt: -1 });
		const last30DaysIncomes = await Income.find({
			user: userId,
		})
			.sort({ createdAt: -1 })
			.limit(30);
		const last30DaysExpenses = await Expenses.find({
			user: userId,
		})
			.sort({ createdAt: -1 })
			.limit(30);
		const lastIncomes = await Income.find({ user: userId })
			.sort({ createdAt: -1 })
			.limit(5);
		const lastExpense = await Expenses.find({
			user: userId,
		})
			.sort({ createdAt: -1 })
			.limit(5)
			.populate({ path: "category", select: "name" });
		const incomeTransaction = lastIncomes.map((txn) => ({
			...txn.toObject(),
			type: "income",
		}));
		const expenseTransaction = lastExpense
			.map((txn) => ({
				...txn.toObject(),
				type: "expense",
			}))
		const result = [...incomeTransaction, ...expenseTransaction];
		const allLastTransactions = result
			.sort((a, b) => b.updatedAt - a.updatedAt)
			.slice(0, 5);
		const last30DaysTransactions = [
			...last30DaysIncomes.map((txn) => ({
				...txn.toObject(),
				type: "income",
			})),
			...last30DaysExpenses.map((txn) => ({
				...txn.toObject(),
				type: "expense",
			})),
		];
		const transactionResult = last30DaysTransactions
			.sort((a, b) => b.updatedAt - a.updatedAt)
			.slice(0, 15);
		res.status(200).json({
			status: true,
			message: "recent transactions fetched",
			data: {
				recentTransactions: allLastTransactions,
				lastIncomeTransactions: last30DaysIncomes,
				last30DaysTransactions,
				seeAllTransactions: transactionResult,
			},
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: false,
			message: error.message || "Internal server Error",
		});
	}
};

module.exports = {
	dashboardGet,
};
