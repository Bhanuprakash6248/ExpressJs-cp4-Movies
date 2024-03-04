const express = require('express')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const app = express()
app.use(express.json())

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
const convertMovieDbToResponseObj = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDirectorDbToResponseObj = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}
//API 1 -> (Get all movies)

app.get('/movies/', async (request, response) => {
  const getAllQuery = `
  SELECT *
  FROM movie;
  `
  const movieTable = await db.all(getAllQuery)
  response.send(movieTable.map(each => ({movieName: each.movie_name})))
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

//API 3 -> Get a movie Table

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  SELECT *
  FROM
    movie
  WHERE
    movie_id = ${movieId};
  `
  const movieTable = await db.get(getMovieQuery)
  response.send(movieTable.map(each => convertMovieDbToResponseObj(each)))
})

//API 4 -> Update the movie table

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body

  const updateQuery = `
  UPDATE
    movie
  SET 
  director_id = ${directorId},
  movie_name= '${movieName}',
  lead_actor = '${leadActor}';
  `
  await db.run(updateQuery)
  response.send('Movie Details Updated')
})

// API 5 -> Delete a movie Table

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE movie_id = ${movieId};
  `
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//API 6 get all directors

app.get('/directors/', async (request, response) => {
  const directorsAllQuery = `
  SELECT *
  FROM
    director;
  `
  const directorDetails = await db.all(directorsAllQuery)
  response.send(directorDetails)
})

//API 7 get  directors

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirector = `
  SELECT *
  FROM director
  WHERE 
    director_id = ${directorId};
  `
  const directorsDetails = await db.get(getDirector)
  response.send(directorsDetails.map(each => ({movieName: each.movie_name})))
})
