const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const s3 = require("./bucket"); // S3 클라이언트 불러오기

const upload = multer({
	limits: { fileSize: 5 * 1024 * 1024 },
	storage: multerS3({
		s3: s3,
		bucket: process.env.AWS_BUCKET_NAME,
		key: function (req, file, cb) {
			const directory = req.body.directory || "images";
			const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
			cb(
				null,
				`${directory}/${uniqueSuffix}${path.extname(file.originalname)}`,
			); // S3에 저장될 파일 경로와 이름
		},
		contentType: multerS3.AUTO_CONTENT_TYPE,
	}),
});

module.exports = upload;
