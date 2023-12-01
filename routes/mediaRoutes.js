const express = require('express');
const router = express.Router();
const db = require('../appService');
const app = express();

const root = 'media/'

const Type = Object.freeze({
    BOOK: 0,
    FILM: 1,
    MUSIC: 2,
    NOT_FOUND: 400
});


// All these routes fall under views/media

router.get("/", async(req, res) => {
    res.redirect('/media/browse');
});

router.get("/browse", async (req, res) => {
    try {
        const book_data = await db.execute("SELECT * FROM \"BOOK\" ORDER BY dbms_random.value FETCH FIRST 20 ROWS ONLY");
        const film_data = await db.execute("SELECT * FROM \"Film\" ORDER BY dbms_random.value FETCH FIRST 20 ROWS ONLY");
        //console.log(book_data);
        res.render(root + "browse", {root:root, books: book_data, films: film_data});
    } catch (error) {
        console.error("Error fetching data:", error)
        res.status(500).json({ error: "An error occurred while fetching data." });
    }
});

router.get("/search", async (req, res) => {
    try {
        res.render(root + "search", {root:root})
    } catch (Error) {
        res.status(500).json({ error: "An error occured while rendering the page." });
    }
});

router.get("/book/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const book_data = await db.execute("SELECT * FROM BOOK WHERE \"id\" = " + id);
        res.render(root + "item", {root:root, book:book_data[0], type:Type.BOOK, id:id});
    } catch (Error) {
        res.render(root + "item", { root:root, type: Type.NOT_FOUND});
        // res.status(404).json({ error: "Media not found."});
    }
});

router.get("/film/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const film_data = await db.execute("SELECT * FROM \"Film\" WHERE \"id\" = " + id);
        console.log(film_data[0]);
        res.render(root + "item", {root:root, film:film_data[0], type:Type.FILM, id:id});
    } catch (Error) {
        res.status(404).json({ error: "Media not found." });
    }
});

module.exports = router;
