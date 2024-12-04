const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "http://localhost:5173", // React 클라이언트 URL
		methods: ["GET", "POST"],
	},
});

// 사용자 소켓 ID 매핑
const userSocketMap = {}; // { userId: socketId }

// 소켓 연결 이벤트
io.on("connection", (socket) => {
	console.log("A user connected:", socket.id);
	// 클라이언트가 보낸 userId로 소켓 ID 저장

	socket.on("register", (userId) => {
		userSocketMap[userId] = socket.id;
		socket.join(userId); // userId를 room으로 설정하여 해당 유저만 받을 수 있게 함
		console.log(`User ${userId} connected with socket ID ${socket.id}`);
	});
	// 서버에서 클라이언트로 알림 전송
	// socket.emit("notification", {
	// 	message: "Welcome! You have a new notification.",
	// });

	socket.on("askChildren", (data) => {
		io.to(data.child_id).emit("askAccept", {
			parent_id: data.parent_id,
			message: data.message,
			type: "ask",
		});
	});

	socket.on("askAllowance", (data) => {
		console.log(data);
		io.to(data.parent_id).emit("ask-Accept-Allowance", {
			child_id: data.child_id,
			AllowanceMessage: data.message,
			amount: data.amount,
			notification_id: data.notification_id,
			type: "PleaAllowance",
		});
	});

	// 클라이언트 요청 처리 (예: 특정 이벤트)
	socket.on("newComment", (data) => {
		console.log("Notification to WriterId:", data.writer);
		// 모든 클라이언트에 브로드캐스트
		io.to(data.writer).emit("newCommentNodification", {
			content: data.content,
		});
	});

	socket.on("acceptAllowance", (data) => {
		console.log("22");
		console.log("data", data);
		io.to(data.child_id).emit("acceptAllowance_Noti", {
			parent_id: data.parent_id,
			parent: data.parent,
			message: data.message,
			type: data.type,
		});
	});

	socket.on("sendAllowance", (data) => {
		io.to(data.child_id).emit("send_notification", {
			parent_id: data.parent_id,
			message: data.message,
			noti_id: data.noti_id,
			type: data.type,
		});
	});

	socket.on("rejectAllowance", (data) => {
		console.log(data);
		io.to(data.child_id).emit("send_RejectNotification", {
			parent_id: data.parent_id,
			parent: data.parent,
			parentMessage: data.parentMessage,
			message: data.message,
			type: data.type,
		});
	});

	socket.on("disconnect", () => {
		// 연결된 소켓의 userId를 찾아서 제거
		for (const userId in userSocketMap) {
			if (userSocketMap[userId] === socket.id) {
				console.log(`User ${userId} disconnected`);
				delete userSocketMap[userId];
				break;
			}
		}
	});
});

// 서버 실행
const PORT = 5000;
server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
module.exports = { io, userSocketMap }; // userSocketMap을 내보냄
