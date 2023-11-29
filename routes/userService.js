const db = require('../appService');


// Add new user data to database
async function registerUser(email, name, salt, hashed_password) {
    console.log("Registering user with email: " + email + " name: " + name);

    return await db.withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Users ("email", "fName", "dateCreated", "salt", "hashed_password")
             VALUES (:email, :name, current_date, :salt, :hashed_password)`,
            [email, name, salt, hashed_password],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// Grab information of user specified by email
async function grabUser(email) {
    return await db.withOracleDB(async (connection) => {
        const result = await connection.execute(
            'SELECT * FROM Users WHERE "email" = :email',
            [email])
        return result.rows[0]
    }).catch((err) => {
        console.log("Error grabbing user!");
        console.log(err);
        return [];
    });
}

// Grab list of favourite media
async function grabFavourites(user) {
    try {
        const book_data = await db.execute("SELECT * FROM \"BOOK\" ORDER BY dbms_random.value FETCH FIRST 5 ROWS ONLY");
        return book_data
    } catch (error) {
        console.error("Error fetching data:", error)
    }

}


// const selectFav = `SELECT * FROM "favourites" WHERE ("user_id" = '${req.user.user}')`
// const favourites = await db.execute(selectFav);
// console.log(favourites)

module.exports = {
    grabUser,
    registerUser,
    grabFavourites
};
