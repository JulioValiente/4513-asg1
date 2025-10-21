const path = require("path");
const express = require("express");

const sqlite3 = require("sqlite3").verbose();
const DB_PATH = path.join(__dirname, "data/f1.db");
const db = new sqlite3.Database(DB_PATH);
const app = express();

app.get("/api/circuits", (req, resp) => {
 let  sql = "SELECT * FROM circuits;";
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
 
    resp.send(rows);
    db.close;
  });
});

app.get("/api/circuits/:ref", (req, resp) => {
 let sql = "SELECT * FROM circuits WHERE circuitRef=?;";
  db.all(sql, [req.params.ref], (err, rows) => {
    if (err) {
      throw err;
    }
   
    resp.send(rows);
    db.close;
  });
});


app.get("/api/circuits/season/:ref", (req, resp) => {
  let sql = " SELECT circuits.name FROM circuits INNER JOIN races ON circuits.circuitId = races.circuitId INNER JOIN seasons ON races.year = seasons.year WHERE seasons.year=?  ORDER BY circuits.name ASC";
  db.all(sql, [req.params.ref], (err, rows) => {
    if (err) {
      throw err;
    }
 
    resp.send(rows);
    db.close;
  });
});

app.get("/api/constructors", (req, resp) => {
 let sql = "SELECT * FROM constructors;";
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
   
    resp.send(rows);
    db.close;
  });
});

app.get("/api/constructors/:ref", (req, resp) => {
 let sql = "SELECT * FROM constructors WHERE constructorRef=?;";
  db.all(sql, [req.params.ref], (err, rows) => {
    if (err) {
      throw err;
    }
   
    resp.send(rows);
    db.close;
  });
});

app.get("/api/drivers", (req, resp) => {
 let sql = "SELECT * FROM drivers;";
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
   
    resp.send(rows);
    db.close;
  });
});

app.get("/api/drivers/:ref", (req, resp) => {
 let sql = "SELECT * FROM drivers WHERE driverRef=?;";
  db.all(sql, [req.params.ref], (err, rows) => {
    if (err) {
      throw err;
    }
   
    resp.send(rows);
    db.close;
  });
});

app.get("/api/drivers/search/:ref", (req, resp) => {
 let sql = "SELECT * FROM drivers WHERE LOWER(surname) LIKE LOWER(?);";
  db.all(sql, [req.params.ref], (err, rows) => {
    if (err) {
      throw err;
    }
   
    resp.send(rows);
    db.close;
  });
});

app.get("/api/drivers/race/:ref", (req, resp) => {
 let sql = "SELECT forename, surname FROM drivers INNER JOIN qualifying ON drivers.driverId = qualifying.driverId INNER JOIN races ON qualifying.raceId = races.raceId WHERE races.raceId=?;";
  db.all(sql, [req.params.ref], (err, rows) => {
    if (err) {
      throw err;
    }
   
    resp.send(rows);
    db.close;
  });
});

app.get("/api/races/:ref", (req, resp) => {
 let sql = "SELECT circuits.name, circuits.location, circuits.country FROM circuits INNER JOIN races ON races.circuitId = circuits.circuitId WHERE races.raceId =?;";
  db.all(sql, [req.params.ref], (err, rows) => {
    if (err) {
      throw err;
    }
   
    resp.send(rows);
    db.close;
  });
});

app.get("/api/races/season/:ref", (req, resp) => {
 let sql = "SELECT * FROM races INNER JOIN seasons ON seasons.year = races.year WHERE seasons.year=? ORDER BY round;";
  db.all(sql, [req.params.ref], (err, rows) => {
    if (err) {
      throw err;
    }
   
    resp.send(rows);
    db.close;
  });
});

app.get("/api/races/season/:year/:round", (req, resp) => {
 let sql = "SELECT * FROM races INNER JOIN seasons ON seasons.year = races.year WHERE seasons.year=? AND races.round=?ORDER BY round;";
  db.all(sql, [req.params.year, req.params.round], (err, rows) => {
    if (err) {
      throw err;
    }
   
    resp.send(rows);
    db.close;
  });
});

app.get("/api/races/circuits/:ref", (req, resp) => {
 let sql = "SELECT * FROM races INNER JOIN circuits ON circuits.circuitId = races.circuitId WHERE circuits.circuitRef=?;";
  db.all(sql, [req.params.ref], (err, rows) => {
    if (err) {
      throw err;
    }
   
    resp.send(rows);
    db.close;
  });
});

app.get("/api/races/circuits/:ref/season/:start/:end", (req, resp) => {
 let sql = "SELECT * FROM races INNER JOIN circuits ON circuits.circuitId = races.circuitId INNER JOIN seasons ON seasons.year = races.year  WHERE circuits.circuitRef=? AND seasons.year BETWEEN ? AND ?;";
  db.all(sql, [req.params.ref,req.params.start,req.params.end], (err, rows) => {
    if (err) {
      throw err;
    }
   
    resp.send(rows);
    db.close;
  });
});

app.get("/api/results/:ref", (req, resp) => {
 let sql = "SELECT drivers.driverRef, drivers.code,drivers.forename,drivers.surname, races.name,races.round, races.year,races.date,constructors.name,constructors.constructorRef, constructors.nationality FROM drivers JOIN qualifying ON qualifying.driverId = drivers.driverId JOIN races ON races.raceId= qualifying.raceId JOIN constructors ON qualifying.constructorId = constructors.constructorId JOIN results ON results.raceId = races.raceId WHERE races.raceId =? ORDER BY results.grid ASC;";
  db.all(sql, [req.params.ref], (err, rows) => {
    if (err) {
      throw err;

    }
   
    resp.send(rows);
    db.close;
  });
});

app.get("/api/results/driver/:ref", (req, resp) => {
 let sql = "SELECT * FROM results INNER JOIN drivers ON drivers.driverId = results.driverId WHERE drivers.driverRef=?;";
  db.all(sql, [req.params.ref], (err, rows) => {
    if (err) {
      throw err;
    }
   
    resp.send(rows);
    db.close;
  });
});

app.get("/api/results/drivers/:ref/seasons/:start/:end", (req, resp) => {
 let sql = "SELECT * FROM results INNER JOIN drivers ON drivers.driverId = results.driverId INNER JOIN races ON races.raceId = results.raceId INNER JOIN seasons ON races.year = seasons.year WHERE drivers.driverRef=? AND seasons.year BETWEEN ? AND ?;";
  db.all(sql, [req.params.ref, req.params.start,req.params.end], (err, rows) => {
    if (err) {
      throw err;
    }
   
    resp.send(rows);
    db.close;
  });
});

app.get("/api/qualifying/:ref", (req, resp) => {
 let sql = "SELECT * FROM qualifying WHERE qualifying.raceId =? ORDER BY position ASC;";
  db.all(sql, [req.params.ref], (err, rows) => {
    if (err) {
      throw err;
    }
   
    resp.send(rows);
    db.close;
  });
});




app.listen(process.env.PORT||8080 , () => {
  console.log("listening on port 8080");
});
