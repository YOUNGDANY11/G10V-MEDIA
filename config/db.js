const {Pool} = require('pg')
require('dotenv').config()

const pool = new Pool({
    connectionString: process.env.DB_URL,
    options: `-c timezone=${process.env.DB_TIMEZONE || 'America/Bogota'}`
})

module.exports = pool