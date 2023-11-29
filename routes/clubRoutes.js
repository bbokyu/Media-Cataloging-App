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

    console.log(club_data)

    return res.render(root + "index", { root:root, clubs:club_data }); 
});

router.get("/create", async (req, res) => {
    return res.render(root + "create", { root:root });
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


// Discussions

router.get("/:id/:did/", async(req, res) => {
    const id = req.params.id;
    const did = req.params.did;

    const discussion_name = await db.execute(`SELECT d."content" FROM "Discussion" d WHERE d."id" = ${did}`)

    const reply_data = await db.execute(`SELECT * FROM "Reply" r WHERE r."discussion_id" = ${did} ORDER BY r."date" ASC`);

    console.log(reply_data);

    return res.render(root + "discussion", { root:root, discussion_name:discussion_name, replies:reply_data })
});


module.exports = router;
