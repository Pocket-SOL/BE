const swaggerJsdoc = require("swagger-jsdoc");

// Swagger 설정 정의
const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Meditator's Node Express API with Swagger",
			version: "0.1.0",
			description:
				"This is a simple CRUD API application made with Express and documented with Swagger",
			license: {
				name: "MIT",
				url: "https://spdx.org/licenses/MIT.html",
			},
			contact: {
				name: "Meditator",
				url: "https://github.com/Pocket-SOL/BE",
			},
		},
		servers: [
			{
				url: "http://localhost:3000/",
			},
			{
				url: "http://52.79.58.245:8080/",
			},
		],
	},
	apis: ["./routes/*.js"], // 주석에서 API 문서화 추출
};

// Swagger 사양 생성
const specs = swaggerJsdoc(options);

module.exports = specs;
