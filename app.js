var createError = require("http-errors");
var express = require("express");
const cors = require("cors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// userAuth 미들웨어 등록
const userAuth = require("./middlewares/userAuth");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const accountsRouter = require("./routes/accounts");
const subaccountRouter = require("./routes/subaccounts");
const purchasesRouter = require("./routes/purchases");
const commentRouter = require("./routes/comment");
const historyRouter = require("./routes/histories");
const pleaRouter = require("./routes/plea");

const childregnotisRouter = require("./routes/childregnotis");
const notificationRouter = require("./routes/notifications");

const quizRouter = require("./routes/quiz");
const tipRouter = require("./routes/tip");

const schoolsRouter = require("./routes/schools");

//swagger 추가
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");
// sequelize 라이브러리로 ORM 사용
const sequelize = require("./models/index.js").sequelize;
const app = express();
//cron
const scheduleCronJob = require("./cron/transferSurplus");
// cors 미들웨어 설정 - 다른 미들웨어보다 앞에 위치해야 함
app.use(
	cors({
		origin: "http://localhost:5173", // Vite 개발 서버 주소
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type"],
	}),
);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// userAuth 전역적으로 적용
// app.use(userAuth);

app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/purchases", purchasesRouter);
app.use("/api/comments", commentRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/subaccounts", subaccountRouter);
app.use("/api/histories", historyRouter);
app.use("/api/schools", schoolsRouter);

app.use("/api/plea", pleaRouter);

app.use("/api/childregnotis", childregnotisRouter);
app.use("/api/notifications", notificationRouter);

app.use("/api/quiz", quizRouter);
app.use("/api/tip", tipRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});
//매월 1일
scheduleCronJob();
//1분 테스트
// scheduleCronJob("*/1 * * * *");
module.exports = app;
