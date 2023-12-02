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
async function grabFavouriteBooks(user, date_filter) {
    return await db.withOracleDB(async (connection) => {
        const fav_book_query = `SELECT * from BOOK where BOOK."id" in (select m."book_id" from "favourites" f, "Media" m where f."user_id" = '${user}' and f."media_id" = m."id") and BOOK."date" > ${date_filter}`
        const book_data = await connection.execute(fav_book_query)
        return book_data.rows
    }).catch((err) => {
        console.log("Error grabbing favourite books!");
        console.log(err);
        return [];
    });
}


async function grabFavouriteFilms(user, date_filter) {
    return await db.withOracleDB(async (connection) => {
        const fav_film_query = `SELECT * from "Film" where "Film"."id" in (select m."film_id" from "favourites" f, "Media" m where f."user_id" = '${user}' and f."media_id" = m."id") and "Film"."date" > ${date_filter}`
        const film_data = await connection.execute(fav_film_query)
        return film_data.rows
    }).catch((err) => {
        console.log("Error grabbing favourite books!");
        console.log(err);
        return [];
    });
}


async function changeUserName(user, newName) {
    return await db.withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE USERS SET "fName" = '${newName}' where "email" = '${user}'`,
            [],
            { autoCommit: true })
        return result.rowsAffected > 0
    }).catch((error) => {
        console.log("Error change User name!");
        console.log(error);
        return false;
    });
}


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


async function changeUserPassword(email, salt, hashed_password) {

    console.log("Updating user password with email: " + email);

    return await db.withOracleDB(async (connection) => {

        const resultUser = await connection.execute(
            `UPDATE USERS SET "hashed_password" = :hashed_password, "salt" = :salt WHERE "email" = :email`,
            [hashed_password, salt, email],
            { autoCommit: true }
        );


            
        console.log(resultUser)

        return resultUser.rowsAffected && resultUser.rowsAffected > 0;

    }).catch((error) => {
        console.log(error)
        return false;
    });
}

async function checkEmail(email) {

    return await db.withOracleDB(async (connection) => {

        const result = await connection.execute(
            `SELECT * from USERS WHERE "email" = :email`,
            [email]
        );
        
        console.log(result.rows.length)
        return result.rows.length > 0;

    }).catch((error) => {
        console.log(error)
        return false;
    });

}
module.exports = {
    grabUser,
    registerUser,
    grabFavouriteBooks,
    grabFavouriteFilms,
    deleteUser,
    changeUserName,
    changeUserPassword,
    checkEmail
};
