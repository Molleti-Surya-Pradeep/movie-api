const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const path = require("path");
app.use(express.json());
let db = null;
const dbpath = path.join(__dirname, "moviesData.db");
const intilizeserverandDB = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Started Successfully");
    });
  } catch (e) {
    console.log(`Db error: ${e.message}`);
    process.exit(1);
  }
};

intilizeserverandDB();

function dbtoresponseconversion(dbobject) {
  return {
    movieId: dbobject.movie_id,
    movieName: dbobject.movie_name,
    directorId: dbobject.director_id,
    leadActor: dbobject.lead_actor,
    directorName: dbobject.director_name,
  };
}

// Api 1

app.get("/movies", async (request, response) => {
  const moviesQuery = `SELECT movie_name FROM movie;`;

  const moviearray = await db.all(moviesQuery);
  response.send(moviearray.map((eachitem) => dbtoresponseconversion(eachitem)));
});

// Api 2

app.post("/movies", async (request, response) => {
  const moviedetails = request.body;
  const { directorId, movieName, leadActor } = moviedetails;
  const movieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES (
        '${directorId}',
        '${movieName}',
        '${leadActor}'
    );`;

  const added = await db.run(movieQuery);
  const movie_id = added.lastID;

  response.send("Movie Successfully Added");
});

// Api 3

app.get("/movies/:movieid", async (request, response) => {
  const { movieid } = request.params;
  const movieQuery = `
    SELECT * FROM movie WHERE movie_id = '${movieid}';`;
  const moviearray = await db.get(movieQuery);
  console.log(moviearray);
  response.send(dbtoresponseconversion(moviearray));
});

// Api 4

app.put("/movies/:movieid", async (request, response) => {
  const { movieid } = request.params;
  const moviedetails = request.body;
  const { directorId, movieName, leadActor } = moviedetails;
  const movieQuery = `
    UPDATE movie SET
    director_id = '${directorId}',
    movie_name= '${movieName}',
    lead_actor= '${leadActor}'
    WHERE movie_id='${movieid}';`;

  await db.run(movieQuery);
  response.send("Movie Details Updated");
});

// Api 5

app.delete("/movies/:movieid", async (request, response) => {
  const { movieid } = request.params;
  const movieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieid};`;

  await db.run(movieQuery);
  response.send("Movie Removed");
});

// Api 6

app.get("/directors", async (request, response) => {
  const directorQuery = "SELECT * FROM director;";
  const directorarray = await db.all(directorQuery);
  response.send(directorarray.map((item) => dbtoresponseconversion(item)));
});

// Api 7

app.get("/directors/:directorid/movies", async (request, response) => {
  const { directorid } = request.params;
  const directorQuery = `SELECT movie_name FROM movie WHERE director_id = ${directorid};`;
  const directorArray = await db.all(directorQuery);
  response.send(directorArray.map((item) => dbtoresponseconversion(item)));
});

module.exports = app;
