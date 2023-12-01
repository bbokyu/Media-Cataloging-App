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
    const author_data = await db.execute(`
        SELECT C."id" AS author_id,
                C."name" AS author_name,
                COUNT(B."id") AS book_count 
        FROM "Creator" C 
        LEFT JOIN BOOK B 
        ON C."id" = B.AUTHOR 
        WHERE C."name" IS NOT NULL 
        GROUP BY C."id", C."name"
        ORDER BY book_count DESC
        `);

    console.log(author_data)

    return res.render(root + "index", { root:root, authors:author_data }); 
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;

    console.log(Number(id))

    if (isNaN(Number(id)))
        return res.render("notfound")

    const club_data = await db.execute(`SELECT * FROM "Club" WHERE "id" = ${id}`);
    const discussion_data = await db.execute(`SELECT * FROM "Discussion" d WHERE d."club_id" = ${id} ORDER BY d."date" DESC`)

    console.log(discussion_data);



    return res.render(root + "club", { root:root, club:club_data[0], discussions:discussion_data })
});

module.exports = router;
