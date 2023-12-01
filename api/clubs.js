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

        await db.insert(`INSERT INTO "member_of" m ("user_id", "club_id", "role") VALUES ('${userid}', ${clubid[0][0]}, 0)`);

        return res.send(`<div> Your club has been created!</div>`)
    } catch (Error) {
        return res.send(Error);
    }
});

router.post("/dcreate", async (req, res) => {
    const title = req.body.discussion_title;
    const clubid = req.body.club_id;
    const userid = req.user.user;

    try {
        const query = `INSERT INTO "Discussion" ("club_id", "author_id", "content") VALUES (${clubid}, '${userid}', '${title}')`
        console.log(query);
        await db.insert(query);

        const club_update = `UPDATE "Club" c SET c.DISCUSSION_COUNT = c.DISCUSSION_COUNT + 1 WHERE c."id" = ${clubid}`
        await db.insert(club_update);

        return res.send(`<div> Your discussion has been created! You can find it on the <a href="/clubs/${clubid}">discussion page</a></div>`)
    } catch (Error) {
        return res.send(`<div>There was a error posting your reply.  Please try again later and make sure you are logged in.</div>`);
    }
});

router.post("/rcreate", async (req, res) => {
    const content = req.body.content;
    const did = req.body.discussion_id;
    const userid = req.user.user;

    console.log("Content:", content, "did:", did, "userid", userid);

    try {
        const query = `INSERT INTO "Reply" ("discussion_id", "author_id", "content") VALUES (${did}, '${userid}', '${content}')`
        console.log(query)
        await db.insert(query);
        
        return res.send(`<div> Your reply has been posted!</div>`)
    } catch (Error) {
        return res.send(`<div>There was a error posting your reply.  Please try again later and make sure you are logged in.</div>`)
    }

});


router.post("/load", async (req, res) => {

    let query = `SELECT * FROM "Club"`;

    const club_data = await db.execute(query);
    
    tablehtml = '';

    for (let i = 0; i < club_data.length; i++) {
        tablehtml += `<table style="margin-top: 10px">
            <thead>
                <tr>
                    <th><a href="/clubs/${club_data[i][0]}">${club_data[i][2]}</a></th>
                    <th align="right">Created ${club_data[i][1]}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${club_data[i][3]}</td>
                </tr>
            </tbody>
        </table>`
    }

    return res.send(tablehtml)

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

 
