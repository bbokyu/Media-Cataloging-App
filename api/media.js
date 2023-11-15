const express = require('express');
const router = express.Router();
const db = require('../appService');

const root = 'media/'

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
        const book_data = await db.execute("SELECT * FROM \"Book\" WHERE \"title\" LIKE \'\%" + req.body.search + "\%\'");

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


module.exports = router;

