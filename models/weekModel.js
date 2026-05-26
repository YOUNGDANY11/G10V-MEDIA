const pool = require('../config/db')

const getAll = async() => {
    const result = await pool.query('SELECT * FROM weeks ORDER BY id_week ASC')
    return result.rows
}

const getActive = async() => {
    const result = await pool.query(
        `SELECT *
         FROM weeks
         WHERE delivery_date = (NOW() AT TIME ZONE 'America/Bogota')::date
           AND (NOW() AT TIME ZONE 'America/Bogota')::time BETWEEN start_time AND end_time
         ORDER BY start_time ASC, id_week ASC`
    )
    return result.rows
}

const getById = async(id_week) => {
    const result = await pool.query('SELECT * FROM weeks WHERE id_week = $1', [id_week])
    return result.rows[0]
}

const create = async(name, delivery_date, start_time, end_time) => {
    const result = await pool.query(
        'INSERT INTO weeks (name, delivery_date, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, delivery_date, start_time, end_time]
    )
    return result.rows[0]
}

const deleteWeek = async(id_week) => {
    const result = await pool.query('DELETE FROM weeks WHERE id_week = $1 RETURNING *', [id_week])
    return result.rows[0]
}

module.exports = {
    getAll,
    getActive,
    getById,
    create,
    deleteWeek
}