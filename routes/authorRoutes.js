const express = require('express');
const router = express.Router({mergeParams: true});
const db = require('../appService');

const root = 'authors/'

const Type = Object.freeze({
    BOOK: 0,
    FILM: 1,
    MUSIC: 2,
    NOT_FOUND: 400
});

router.get("/", async (req, res) => {
    return res.render(root + "index", { root:root }); 
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;

    console.log(Number(id))

    if (isNaN(Number(id)))
        return res.render("notfound")

    const author_data = await db.execute(`SELECT * FROM "Creator" WHERE "id" = ${id}`);
    const author_count = await db.execute(`SELECT COUNT(*) FROM BOOK WHERE AUTHOR = ${id}`)

    console.log(author_data);

    return res.render(root + "author", { root:root, author:author_data[0], author_count:author_count })
});

module.exports = router;
