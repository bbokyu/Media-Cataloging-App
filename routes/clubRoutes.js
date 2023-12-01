const express = require('express');
const router = express.Router({mergeParams: true});
const db = require('../appService');

const root = 'clubs/'

const Type = Object.freeze({
    BOOK: 0,
    FILM: 1,
    MUSIC: 2,
    NOT_FOUND: 400
});

router.get("/", async (req, res) => {
    const club_data = await db.execute(`SELECT * FROM "Club"`);

    const supermember = await db.execute(`SELECT COUNT(*) FROM USERS u WHERE NOT EXISTS ((SELECT c."id" FROM "Club" c) MINUS (SELECT mo."club_id" FROM "member_of" mo WHERE mo."user_id" = u."email"))`);

    const popular = await db.execute(`SELECT COUNT(*) as club_count FROM "Club" WHERE member_count > (SELECT AVG(member_count) FROM "Club") GROUP BY member_count`);

    return res.render(root + "index", { root:root, clubs:club_data, popular:popular, supermember:supermember }); 
});

router.get("/create", async (req, res) => {
    return res.render(root + "create", { root:root });
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;

    if (isNaN(Number(id)))
        return res.render("notfound")

    const club_data = await db.execute(`SELECT "id", "date", "name", "description", COMMENT_COUNT, DISCUSSION_COUNT, MEMBER_COUNT FROM "Club" WHERE "id" = ${id}`);
    const discussion_data = await db.execute(`SELECT * FROM "Discussion" d WHERE d."club_id" = ${id} ORDER BY d."date" DESC`)

    return res.render(root + "club", { root:root, club:club_data[0], discussions:discussion_data })
});


// Discussions

router.get("/:id/:did/", async(req, res) => {
    const id = req.params.id;
    const did = req.params.did;

    const discussion_name = await db.execute(`SELECT d."content" FROM "Discussion" d WHERE d."id" = ${did}`)

    const reply_data = await db.execute(`SELECT * FROM "Reply" r WHERE r."discussion_id" = ${did} ORDER BY r."date" ASC`);

    return res.render(root + "discussion", { root:root, discussion_name:discussion_name, replies:reply_data })
});


module.exports = router;
