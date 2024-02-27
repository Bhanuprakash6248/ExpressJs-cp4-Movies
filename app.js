const express = require('express')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const app = express()

let db = null
const dbpath = path.join(__dirname, 'moviesData.db')

const initializeServerAndDatabase = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is started...')
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
    process.exit(1)
  }
}

initializeServerAndDatabase()

module.exports = app

//API 1 -> (Get all movies)

app.get('/movies/', async (request, response) => {
  const getAllQuery = `
  SELECT *
  FROM movie;
  `
  const movieTable = await db.all(getAllQuery)
  response.send(movieTable)
})

//API 2 -> (Create movies)

app.post('/movies/', async (request, response) => {
  const playerDetails = request.body
  const {directorId, movieName, leadActor} = playerDetails

  const createdQuery = `
  INSERT INTO 
    movie(director_id,movie_name,lead_actor)
  VALUES(
    ${directorId},
    '${movieName}',
    '${leadActor}'
  );`
  const dbResponse = await db.run(createdQuery)
  const movieId = dbResponse.lastID
  response.send('Movie Successfully Added')
})
