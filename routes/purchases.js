var express = require("express");
const db = require("./mysql");

const app = express();
app.use(express.json());

//get
app.get("/purchases", async (req, res) => {
  try {
    const purchase_list = await db.query("SELECT * FROM purchases;");
    res.json({ success: true, purchase_list: purchase_list });
  } catch (error) {}
});
