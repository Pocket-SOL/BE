// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
// 	cors: {
// 		origin: "http://localhost:3000", // React 클라이언트 URL
// 		methods: ["GET", "POST"],
// 	},
// });

// // 소켓 연결 이벤트
// io.on("connection", (socket) => {
// 	console.log("A user connected:", socket.id);

// 	// 서버에서 클라이언트로 알림 전송
// 	socket.emit("notification", {
// 		message: "Welcome! You have a new notification.",
// 	});

// 	// 클라이언트 요청 처리 (예: 특정 이벤트)
// 	socket.on("send-notification", (data) => {
// 		console.log("Notification from client:", data);
// 		// 모든 클라이언트에 브로드캐스트
// 		io.emit("notification", { message: data.message });
// 	});

// 	// 연결 종료 이벤트
// 	socket.on("disconnect", () => {
// 		console.log("User disconnected:", socket.id);
// 	});
// });

// // 서버 실행
// const PORT = 5000;
// server.listen(PORT, () => {
// 	console.log(`Server is running on http://localhost:${PORT}`);
// });
