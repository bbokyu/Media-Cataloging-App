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

router.get("/subscriptionstatus", async (req, res) => {
    if (req.user == null) {
        return res.send(`<a href="/user/login"><button>Login to subscribe</button></a>`)
    }

    console.log("id:", req.user.user, "club id:", req.query.club_id)

    const subscription_data = await db.execute(`SELECT * FROM "member_of" WHERE "user_id" = '${req.user.user}' AND "club_id" = ${req.query.club_id}`);

    if (subscription_data.length > 0) {
        return res.send(`<button style="width: fit-content" type="button" hx-post="/api/clubs/unsubscribe" hx-trigger="click" hx-target="this" hx-swap="outerHTML" hx-vals='{"club_id":${req.query.club_id}}'>Unsubscribe</button>`)
    }

    return res.send(`<button style="width: fit-content" type="button" hx-post="/api/clubs/subscribe" hx-trigger="click" hx-target="this" hx-swap="outerHTML" hx-vals='{"club_id":${req.query.club_id}}'>Subscribe</button>`)
});

router.post("/subscribe", async(req, res) => {
    try {
        const response = await db.insert(`INSERT INTO "member_of" ("user_id", "club_id", "role") VALUES ('${req.user.user}', ${req.body.club_id}, 3)`)

        const increase = `UPDATE "Club" c SET c.MEMBER_COUNT = c.MEMBER_COUNT + 1 WHERE c."id" = ${req.body.club_id}`
        console.log(increase)
        await db.insert(increase)

        return res.send(`<button style="width: fit-content" type="button" hx-post="/api/clubs/unsubscribe" hx-trigger="click" hx-target="this" hx-swap="outerHTML" hx-vals='{"club_id":${req.body.club_id}}'>Unsubscribe</button>`)
    } catch (e) {
        return res.send(`<div>Error subscribing. Try again and make sure you are logged in.</div>`)
    }
});

router.post("/unsubscribe", async(req, res) => {
    try {
        const response = await db.insert(`DELETE FROM "member_of" mo WHERE "user_id" = '${req.user.user}' AND "club_id" = ${req.body.club_id}`)
        
        await db.insert(`UPDATE "Club" c
                            SET c.MEMBER_COUNT  = 
                                CASE
                                    WHEN c.MEMBER_COUNT  > 0 THEN c.MEMBER_COUNT  - 1
                                    ELSE 0
                                END
                            WHERE c."id"  = ${req.body.club_id}`)

        return res.send(`<button style="width: fit-content" type="button" hx-post="/api/clubs/subscribe" hx-trigger="click" hx-target="this" hx-swap="outerHTML" hx-vals='{"club_id":${req.body.club_id}}'>Subscribe</button>`)
    } catch (e) {
        return res.send(`<div>Error unsubscribing.  Try again and make sure you are logged in.</div>`)
    }
});

module.exports = router;

 
