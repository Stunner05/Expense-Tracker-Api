if (process.env.NODE_ENV !== "production") {
	const { port, db_connect } = require("./config");
	db_connect().then(() => {
		app.listen(port, () => console.log(`Listening on ${port}`));
	});
}
