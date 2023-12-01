const db = require('../appService');


// Add new user data to database
async function registerUser(email, name, salt, hashed_password, postalCode, city, province) {
    console.log("Registering user with email: " + email + " name: " + name);


    return await db.withOracleDB(async (connection) => {

        // Checks if postal code already exists in database
        const duplicateLocation = await connection.execute('SELECT * FROM "Postal_Code" WHERE "postal_code" = :postalCode',
            [postalCode]);

        if (duplicateLocation.rows.length == 0) {
            const resultPostalCode = await connection.execute(
                `INSERT INTO "Postal_Code" ("postal_code", "city", "province")
                 VALUES (:postal_code, :city, :province)`,
                [postalCode, city, province],
                { autoCommit: true }
            );
        }


        const resultUser = await connection.execute(
            `INSERT INTO Users ("email", "fName", "dateCreated", "salt", "hashed_password", "postal_code")
             VALUES (:email, :name, current_date, :salt, :hashed_password, :postalCode)`,
            [email, name, salt, hashed_password, postalCode],
            { autoCommit: true }
        );

        return resultUser.rowsAffected && resultUser.rowsAffected > 0;

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
async function grabFavouriteBooks(user) {
    return await db.withOracleDB(async (connection) => {
        const fav_book_query = `select * from BOOK where BOOK."id" in (select m."book_id" from "favourites" f, "Media" m where f."user_id" = '${user}' and f."media_id" = m."id")`
        const book_data = await connection.execute(fav_book_query)
        return book_data.rows
    }).catch((err) => {
        console.log("Error grabbing favourite books!");
        console.log(err);
        return [];
    });
}


async function grabFavouriteFilms(user) {
    return await db.withOracleDB(async (connection) => {
        const fav_film_query = `select * from "Film" where "Film"."id" in (select m."film_id" from "favourites" f, "Media" m where f."user_id" = '${user}' and f."media_id" = m."id")`
        const film_data = await connection.execute(fav_film_query)
        return film_data.rows
    }).catch((err) => {
        console.log("Error grabbing favourite books!");
        console.log(err);
        return [];
    });
}
// const selectFav = `SELECT * FROM "favourites" WHERE ("user_id" = '${req.user.user}')`
// const favourites = await db.execute(selectFav);
// console.log(favourites)

// async function updateUserName(user) {
//     return await db.withOracleDB(async (connection) => {
//         const result = await connection.execute('SELECT * FROM Users WHERE "email" = :email', [email])
//         return true
//     }).catch((error) => {
//         console.log("Error change User Information!");
//         console.log(error);
//         return false;
//     });
// }

// async function updateUserPassword(user) {
//     return await db.withOracleDB(async (connection) => {
//         const result = await connection.execute('SELECT * FROM Users WHERE "email" = :email', [email])
//         return true
//     }).catch((error) => {
//         console.log("Error change User Information!");
//         console.log(error);
//         return false;
//     });
// }

// Delete User from Database and all its children relations
async function deleteUser(user) {
    return await db.withOracleDB(async (connection) => {
        const result = await connection.execute('DELETE FROM Users WHERE "email" = :email',
            [user],
            { autoCommit: true }
        )
        return  result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.log("Error Deleting User!");
        console.log(error);
        return false;
    });
}



module.exports = {
    grabUser,
    registerUser,
    grabFavouriteBooks,
    grabFavouriteFilms,
    deleteUser
};
