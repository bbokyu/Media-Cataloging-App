const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

oracledb.fetchAsString = [ oracledb.CLOB ];

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`
};

// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

async function connect(action) {
    let connection;
    try {
      // Get a standalone Oracle Database connection
      connection = await oracledb.getConnection(dbConfig);
      console.log('Connection was successful!');

        return await action(connection);

    } catch (err) {
      console.error(err);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.

async function execute(query) {
    return await connect(async (connection) => {
        const result = await connection.execute(query);
        return result.rows;
    }).catch(() => {
        console.error("There was an error with the query.")
        return [];
    });
}

async function insert(query) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(query);
        connection.commit();

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

module.exports = {
    execute,
    withOracleDB,
    insert
};
