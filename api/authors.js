const express = require('express');
const router = express.Router();
const db = require('../appService');

const root = 'authors/'

const Type = Object.freeze({
    BOOK: 0,
    FILM: 1,
    MUSIC: 2,
    NOT_FOUND: 400
});

router.post("/search", async (req, res) => {

    let filter = null;

    try {
        if (Number(req.body.bw_filter) > 0) {
            filter = Number(req.body.bw_filter);
        }
    } catch (e) {
        console.log(e);
    }

    let query = null;

    if (filter) {
        query = `SELECT C."id" AS author_id,
                    C."name" AS author_name,
                    COUNT(B."id") AS book_count 
            FROM "Creator" C 
            LEFT JOIN BOOK B 
            ON C."id" = B.AUTHOR 
            WHERE C."name" IS NOT NULL 
            GROUP BY C."id", C."name"
            HAVING COUNT(b."id") >= ${filter}
            ORDER BY book_count DESC`;
    } else {
        query = `SELECT C."id" AS author_id,
                    C."name" AS author_name,
                    COUNT(B."id") AS book_count 
            FROM "Creator" C 
            LEFT JOIN BOOK B 
            ON C."id" = B.AUTHOR 
            WHERE C."name" IS NOT NULL 
            GROUP BY C."id", C."name"
            ORDER BY book_count DESC`;
    }
    
    const author_data = await db.execute(query);

    tableHtml = `<tbody id="author_table">\n`

    for (let i = 0; i < author_data.length; i++) {
        tableHtml += `<tr>
            <td>${author_data[i][0]}</td>
            <td><a href='/authors/${author_data[i][0]}'>${author_data[i][1]}</a></td>
            <td>${author_data[i][2]}</td>
        </tr>\n`;
    }

    tableHtml += '</tbody>'

    return res.send(tableHtml);
});

module.exports = router;

 
