const express = require('express');
const router = express.Router();
const db = require('../appService');

const root = 'media/'

const Type = Object.freeze({
    BOOK: 0,
    FILM: 1,
    MUSIC: 2,
    NOT_FOUND: 400
});


// All these routes fall under views/media

router.post("/search", async (req, res) => {
    try {

        let date = null;

        try {
            if (Number(req.body.date_filter) > 1850 < 2030) {
                date = Number(req.body.date_filter);
            }
        } catch (e) {
            console.log(e);
        }

        // Only search if query is longer than 3 chars
        if (req.body.search.length < 3) {
            return res.send('<div id="search-results">Search for more than three characters.</div>');
        }


        // Setup Projection attributes
        let projection_array = [`"id"`];

        if (req.body.title_include) {
            projection_array.push(`"title"`);
        } 

        if (req.body.date_include) {
            projection_array.push(`"date"`);
        }
        
        const projection = projection_array.toString();

        console.log(projection);

        // Set up table
        let tableHtml = `<table id="search-results" class="">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>ID</th>`;

        for (let i = 1; i <  projection_array.length; i++) {
            tableHtml += `<th>${projection_array[i].slice(1, -1)}</th>`
        }

        tableHtml += `</tr>\n</thead>\n<tbody>`;

        // Books
        let query = null;
        if (date) {
            query = `SELECT ${projection} FROM BOOK WHERE "title" LIKE '%${req.body.search}%' AND "date" > ${date}`
        } else {
            query = `SELECT ${projection} FROM BOOK WHERE "title" LIKE '%${req.body.search}%'`
        }

        const book_data = await db.execute(query);

        // Deal with book data
        for (let i = 0; i < book_data.length; i++) {
            tableHtml += `<tr>
                    <td>Book</td>`

            tableHtml += `<td><a href='/media/book/${book_data[i][0]}'>${book_data[i][0]}</a></td>`

            for (let j = 1; j < projection_array.length; j++) {
                tableHtml += `<td>${book_data[i][j]}</td>`
            }

            tableHtml += `</tr>`;
        }


        // FILM
        if (date) {
            query = `SELECT ${projection} FROM "Film" WHERE "title" LIKE '%${req.body.search}%' AND "date" > ${date}`
        } else {
            query = `SELECT ${projection} FROM "Film" WHERE "title" LIKE '%${req.body.search}%'`
        }
        const film_data = await db.execute(query);

        // Deal with film data
        for (let i = 0; i < film_data.length; i++) {
            tableHtml += `<tr>
                    <td>Film</td>`

            tableHtml += `<td><a href='/media/book/${film_data[i][0]}'>${film_data[i][0]}</a></td>`

            for (let j = 1; j < projection_array.length; j++) {
                tableHtml += `<td>${film_data[i][j]}</td>`
            }

            tableHtml += `</tr>`;
        }

        // End table
        tableHtml += `</tbody>\n</table>`;


        // Send results
        return res.send(tableHtml);
    } catch (error) {
        console.error("Error fetching data:", error)
        res.status(500).json({ error: "An error occurred while fetching data." });
    }
});

router.post("/comments", async (req, res) => {
    try {
        const media_id = req.body.mediaid;
        const media_type = req.body.mediatype;

        if (media_type == 0) {
            media_query = "SELECT \"id\" FROM \"Media\" WHERE \"book_id\" = " + media_id;
        } else if (media_type == Type.FILM) {
            media_query = "SELECT \"id\" FROM \"Media\" WHERE \"film_id\" = " + media_id;
        } else {
            throw new Error("Not book or film")
        }

        const query = "SELECT * FROM \"Comment\" WHERE \"media_id\" IN (" + media_query + ')'
        const comment_data = await db.execute(query);

        if (comment_data.length == 0) {
            return res.send('<div id="comments">There aren\'t any comments here, yet...<div>')
        }

        let table = "<div>"

        for (let i = 0; i < comment_data.length; i++) {
            let comment = comment_data[i];
            const datetime = comment[1];
            const rating = Number(comment[2]);
            const author = comment[3];
            const text = comment[5];

            table += `
<table>
    <thead>
        <tr>
            <td>${author}</td>
            <td align="right">${datetime}</td>
        </tr>
    </thead>
        <tr>
            <td>Rating: ${rating}</td>
        </tr>
        <tr>
            <td colspan="2">${text}</td>
        </tr>
</table>
<br>
`
        }

        table += "</div>"

        return res.send(table)
    } catch (Error) {
        return res.send('<div id="comments">There was a problem fetching comments.</div>')
    }
});


router.post("/submit", async (req, res) => {
    const comment = req.body;

    const body = comment.comment;
    const rating = Number(comment.rating);
    const id = comment.media_id
    const type = comment.media_type
    const media_table = (type == 0 ? 'book_id' : 'film_id')

    const mediaquery = `SELECT "id" FROM "Media" WHERE \"${media_table}\" = ${id}` 
    
    const media_id = await db.execute(mediaquery)
    
    const insert = `INSERT INTO "Comment" ("rating", "author_id", "media_id", BODY) VALUES (${rating}, '${req.user.user}', ${media_id}, '${body}')`

    console.log(insert)
    try {
        await db.insert(insert);

        return res.send(`<div>Your comment was submitted sucessfully!</div>`)
    } catch (Error) {
        return res.send("<div>There was an error submitting your comment.<div>")
    }
});

router.post("/libstatus", async (req, res) => {
    const id = req.body.mediaid;
    const type = req.body.mediatype;
    const media_table = (req.body.mediatype == 0 ? 'book_id' : 'film_id')

    console.log("id:", id, "type:", type, "media_table:", media_table)

    if (typeof req.user == 'undefined') {
        return res.send(`<a href=/user/login> <button> Login to add to library</button></a>`)
    }


    const mediaquery = `SELECT "id" FROM "Media" WHERE "${media_table}" = ${id}`

    const media_id = await db.execute(mediaquery);

    const select = `SELECT * FROM "favourites" WHERE ("user_id" = '${req.user.user}' AND "media_id" = ${media_id})`

    const exists = await db.execute(select);

    if (exists.length > 0) {
        return res.send(`<button class="addlibrary" hx-swap="outerHTML" hx-target="this" hx-trigger="click" hx-post="/api/media/remove" hx-vals='{"mediaid": ${id}, "mediatype": ${type}}'>Remove from library</button>`)
    } else {
        return res.send(`<button class="addlibrary" hx-swap="outerHTML" hx-target="this" hx-trigger="click" hx-post="/api/media/add" hx-vals='{"mediaid": ${id}, "mediatype": ${type}}'>Add to library</button>`)
    }
});

router.post("/add", async(req, res) => {

    const id = req.body.mediaid;
    const type = req.body.mediatype;
    const media_table = (req.body.mediatype == 0 ? 'book_id' : 'film_id')

    const mediaquery = `SELECT "id" FROM "Media" WHERE \"${media_table}\" = ${id}`

    console.log(mediaquery);

    const media_id = await db.execute(mediaquery);

    const select = `SELECT * FROM "favourites" WHERE ("user_id" = '${req.user.user}' AND "media_id" = ${media_id})`

    const insert = `INSERT INTO "favourites" ("user_id", "media_id") VALUES ('${req.user.user}', '${media_id}')`

    console.log(insert);
    try {
        const exists = await db.execute(select);

        if (exists.length > 0) {
            return res.send(`<button class="addlibrary" hx-swap="outerHTML" hx-target="this" hx-trigger="click" hx-post="/api/media/remove" hx-vals='{"mediaid": ${id}, "mediatype": ${type}}'>Remove from library</button>`);
        }

        await db.insert(insert);
        return res.send(`<button class="addlibrary" hx-swap="outerHTML" hx-target="this" hx-trigger="click" hx-post="/api/media/remove" hx-vals='{"mediaid": ${id}, "mediatype": ${type}}'>Remove from library</button>`)
    } catch (Error) {
        return res.send(`<div>Unable to add media to library. Try again later.</div>`)
    }


});

router.post("/remove", async (req, res) => {
    const id = req.body.mediaid;
    const type = req.body.mediatype;
    const media_table = (req.body.mediatype == 0 ? 'book_id' : 'film_id')

    const mediaquery = `SELECT "id" FROM "Media" WHERE \"${media_table}\" = ${id}`

    console.log(mediaquery);

    const media_id = await db.execute(mediaquery);

    const insert = `DELETE FROM "favourites" WHERE ("user_id" = '${req.user.user}' AND "media_id" = '${media_id}')`

    console.log(insert);
    try {
        await db.insert(insert);
        return res.send(`<button class="addlibrary" hx-swap="outerHTML" hx-target="this" hx-trigger="click" hx-post="/api/media/add" hx-vals='{"mediaid": ${id}, "mediatype": ${type}}'>Add to library</button>`)
    } catch (Error) {
        return res.send(`<div>Unable to add media to library. Try again later.</div>`)
    }
    return res.send(`<button class="addlibrary" hx-swap="outerHTML" hx-target="this" hx-trigger="click" hx-post="/api/media/add" hx-vals=requestvals>Add to library</button>`);
});

module.exports = router;

 
