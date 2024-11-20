var express = require("express");
const db = require("./mysql");

const app = express();
app.use(express.json());

//get
app.get("/purchases", async (req, res) => {
  try {
    const purchase_list = await db.query("SELECT * FROM Purchases;");
    console.log(purchase_list);
    res.json({ success: true, purchase_list: purchase_list });
  } catch (error) {
    console.error("error fetching purchases: ", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch purchases." });
  }
});
