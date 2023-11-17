const db = require('../appService');

async function registerUser(email, name, password) {
    console.log("Registering user with email: " + email + " name: " + name + " password: " + password);

    return await db.withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO USERS ("username", "name", "date", "password") VALUES (:email, :name, current_date, :password)`,
            [email, name, password],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}


module.exports = {
    registerUser
};