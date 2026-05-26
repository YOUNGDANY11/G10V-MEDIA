const pool = require('../config/db')

const getAll = async() =>{
    const result = await pool.query(
        `SELECT
            t.id_training,
            t.name,
            t.description,
            t.date,
            t.time,
            t.location,
            t.created_at,
            t.updated_at
        FROM trainings t
        ORDER BY t.date DESC, t.time DESC, t.id_training DESC`
    )
    return result.rows
}

const getById = async(id_training)=>{
    const result = await pool.query(
        `SELECT
            t.id_training,
            t.name,
            t.description,
            t.date,
            t.time,
            t.location,
            t.created_at,
            t.updated_at
        FROM trainings t
        WHERE t.id_training = $1`,
        [id_training]
    )
    return result.rows[0]
}

const getByLocation = async(location)=>{
    const result = await pool.query(
        `SELECT
            t.id_training,
            t.name,
            t.description,
            t.date,
            t.time,
            t.location,
            t.created_at,
            t.updated_at
        FROM trainings t
        WHERE t.location ILIKE $1`,
        [`%${location}%`]
    )
    return result.rows
}

const  getTrainingInTimeAnDate = async(time,date)=>{
    const result = await pool.query(
        `SELECT
            t.id_training,
            t.name,
            t.description,
            t.date,
            t.time,
            t.location,
            t.created_at,
            t.updated_at
        FROM trainings t
        WHERE t.time = $1 AND t.date = $2`,
        [time, date]
    )
    return result.rows
}

const create = async(name,description,date,time,location)=>{
    const result = await pool.query('INSERT INTO trainings (name,description,date,time,location) VALUES ($1,$2,$3,$4,$5) RETURNING *',[name,description,date,time,location])
    return result.rows[0]
}

const update = async(name,description,date,time,location,id_training)=>{
    const result = await pool.query('UPDATE trainings SET name =$1 ,description = $2, date = $3, time = $4, location = $5 WHERE id_training = $6 RETURNING *',[name,description,date,time,location,id_training])
    return result.rows[0]
}

const deleteTraining = async(id_training)=>{
    const result = await pool.query('DELETE FROM trainings WHERE id_training = $1 RETURNING *',[id_training])
    return result.rows[0]
}

module.exports = {
    getAll,
    getById,
    getByLocation,
    getTrainingInTimeAnDate,
    create,
    update,
    deleteTraining
}