const express = require('express');
const router = express.Router();
const db = require('../appService');

const root = 'clubs/'

const Type = Object.freeze({
    BOOK: 0,
    FILM: 1,
    MUSIC: 2,
    NOT_FOUND: 400
});

router.post("/create", async (req, res) => {
    const title = req.body.club_title;
    const description = req.body.club_description;
    const userid = req.user.user;
    
    try {
        await db.insert(`INSERT INTO "Club" ("name", "description") VALUES ('${title}', '${description}')`);

        const clubid = await db.execute(`SELECT "id" FROM "Club" c WHERE c."name" = '${title}' AND c."description" = '${description}'`);

        console.log(clubid[0][0]);

        await db.insert(`INSERT INTO "member_of" m ("user_id", "club_id", "role") VALUES ('${userid}', ${clubid[0][0]}, 0)`);

        return res.send(`<div> Your club has been created!</div>`)
    } catch (Error) {
        return res.send(Error);
    }
});

module.exports = router;

 
