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
        
        // Only search if query is longer than 3 chars
        if (req.body.search.length < 3) {
            return res.send('<div id="search-results">Search for more than three characters.</div>');
        }

        // Set up table
        let tableHtml = '<tbody id="search-results" class="">\n';

        // Books
        const book_data = await db.execute("SELECT * FROM BOOK WHERE \"title\" LIKE \'\%" + req.body.search + "\%\'");

        // Deal with book data
        for (let i = 0; i < book_data.length; i++) {
            const id = book_data[i][0]
            const title = book_data[i][1]
            const date = book_data[i][2]

            tableHtml += `<tr><td>Book</td><td><a href='/media/book/${id}'>${title}</a></td><td>${date}</td></tr>\n`;
        }


        // Films
        const film_data = await db.execute("SELECT * FROM \"Film\" WHERE \"title\" LIKE \'\%" + req.body.search + "\%\'");

        // Deal with film data
        for (let i = 0; i < film_data.length; i++) {
            const id = film_data[i][0]
            const title = film_data[i][1]
            const date = film_data[i][2]

            tableHtml += `<tr><td>Film</td><td><a href='/media/film/${id}'>${title}</a></td><td>${date}</td></tr>\n`;
        }

        // Music
        // TODO

        // End table
        tableHtml += '</tbody>';

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

        let table = "<table id=comments>"

        for (let i = 0; i < comment_data.length; i++) {
            let comment = comment_data[i];
            const datetime = comment[1];
            const rating = 5 * Number(comment[2]);
            const author = comment[3];
            const text = comment[5];

            table += `
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
`
        }

        table += "</table>"

        return res.send(table)
    } catch (Error) {
        return res.send('<div id="comments">There was a problem fetching comments.</div>')
    }
});


router.post("/submit", async (req, res) => {
    const comment = req.body;

    const body = comment.comment;
    const rating = 5 / Number(comment.rating);
    const id = comment.media_id
    
    const insert = `INSERT INTO "Comment" ("rating", "author_id", "media_id", BODY) VALUES (${rating}, ${user.user}, ${id}, ${body})`

    try {
        db.execute(insert);
    } catch (Error) {
        return res.send("There was an error submitting your comment.")
    }

    console.log(req);

});

module.exports = router;

 
