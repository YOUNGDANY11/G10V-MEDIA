const pool = require('../config/db')

const getAll = async() => {
    const result = await pool.query(
        `SELECT
            m.id_media,
            m.id_user,
            m.id_week,
            m.name,
            m.description,
            m.document,
            m.created_at,
            m.updated_at,
            u.name AS user_name,
            u.lastname AS user_lastname,
            w.name AS week_name,
            w.delivery_date,
            w.start_time,
            w.end_time
        FROM media m
        INNER JOIN users u ON u.id_user = m.id_user
        INNER JOIN weeks w ON w.id_week = m.id_week
        ORDER BY m.created_at DESC`
    )
    return result.rows
}

const getById = async(id_media) => {
    const result = await pool.query(
        `SELECT
            m.id_media,
            m.id_user,
            m.id_week,
            m.name,
            m.description,
            m.document,
            m.created_at,
            m.updated_at,
            u.name AS user_name,
            u.lastname AS user_lastname,
            w.name AS week_name,
            w.delivery_date,
            w.start_time,
            w.end_time
        FROM media m
        INNER JOIN users u ON u.id_user = m.id_user
        INNER JOIN weeks w ON w.id_week = m.id_week
        WHERE m.id_media = $1`,
        [id_media]
    )
    return result.rows[0]
}

const getByUser = async(id_user) => {
    const result = await pool.query(
        `SELECT
            m.id_media,
            m.id_user,
            m.id_week,
            m.name,
            m.description,
            m.document,
            m.created_at,
            m.updated_at,
            w.name AS week_name,
            w.delivery_date,
            w.start_time,
            w.end_time
        FROM media m
        INNER JOIN weeks w ON w.id_week = m.id_week
        WHERE m.id_user = $1
        ORDER BY m.created_at DESC`,
        [id_user]
    )
    return result.rows
}

const getByWeek = async(id_week) => {
    const result = await pool.query(
        `SELECT
            m.id_media,
            m.id_user,
            m.id_week,
            m.name,
            m.description,
            m.document,
            m.created_at,
            m.updated_at,
            u.name AS user_name,
            u.lastname AS user_lastname,
            w.name AS week_name,
            w.delivery_date,
            w.start_time,
            w.end_time
        FROM media m
        INNER JOIN users u ON u.id_user = m.id_user
        INNER JOIN weeks w ON w.id_week = m.id_week
        WHERE m.id_week = $1
        ORDER BY m.created_at DESC`,
        [id_week]
    )
    return result.rows
}

const create = async(id_user, id_week, name, description, document) => {
    const result = await pool.query(
        `INSERT INTO media (id_user, id_week, name, description, document)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id_user, id_week, name, description, document]
    )
    return result.rows[0]
}

module.exports = {
    getAll,
    getById,
    getByUser,
    getByWeek,
    create
}