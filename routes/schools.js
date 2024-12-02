const express = require("express");
const { User } = require("../models");
const router = express.Router();
const upload = require("../config/multer");
const axios = require("axios");

router.get("/", async (req, res) => {
	const apiKey = process.env.SCHOOL_KEY;
	const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/neisSchoolInfoHs/1/1000/`;
	try {
		const response = await axios.get(url);
		console.log(response.data);
		const data = response.data.neisSchoolInfoHs.row;
		const schoolData = data.map((school) => school.SCHUL_NM);
		console.log(schoolData);
		res.send(schoolData);
	} catch (error) {
		console.error("Error fetching school data:", error);
		res.status(500).json({ error: "Failed to fetch school data" });
	}
});

router.post("/img/", upload.single("image"), (req, res, next) => {
	try {
		const images = req.file;
		//s3 키 , url
		const imageKey = images.key;
		const imageUrl = images.location;

		//response
		res.status(200).json({
			success: true,
			message: "File uplaod successfully",
			data: {
				imageUrl,
				imageKey,
			},
		});
	} catch (error) {
		console.error("File uplaod error", error);
		res.status(500).json({
			success: false,
			message: "Failed to uplaod file",
			error: error.message,
		});
	}
});

//사진 업데이트
router.put("/:id", async (req, res) => {
	console.log(req.params);
	try {
		const user_id = req.params.id;
		const { imgUrl } = req.body;
		const user = await User.findOne({ where: { user_id: user_id } });

		// 데이터가 없으면 404 반환
		if (!user) {
			return res.status(404).json({ message: "Record not found" });
		}

		// 기존 값과 imgUrl 값이 다를 경우에만 업데이트 진행
		if (user.school_auth !== imgUrl) {
			const [affectedCount] = await User.update(
				{ school_auth: imgUrl }, // 업데이트할 값
				{ where: { user_id: user_id } }, // 조건
			);

			console.log("Affected rows:", affectedCount); // 확인

			if (affectedCount === 0) {
				console.error("No rows updated");
				return res.status(404).json({ message: "No record found to update" });
			} else {
				console.log("Photo URL updated successfully");
				return res
					.status(200)
					.json({ message: "Photo URL updated successfully" });
			}
		} else {
			console.log("The photo URL is the same, no update required.");
			return res
				.status(200)
				.json({ message: "Photo URL is already up to date." });
		}
	} catch (error) {
		console.error("Error updating photo URL:", error);
	}
});

module.exports = router;
