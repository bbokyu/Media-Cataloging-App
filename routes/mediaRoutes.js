const express = require('express');
const router = express.Router();
const db = require('../appService');

const root = 'views'

// All these routes fall under /media

router.get("/", async (req, res) => {
    try {
        const data = await db.execute("SELECT * FROM \"Book\" WHERE rownum <= 2");
        console.log(data);
        res.render("media", {root:root, books: data });
    } catch (error) {
        console.error("Error fetching data:", error)
        res.status(500).json({ error: "An error occurred while fetching data." });
    }
});

module.exports = router;
