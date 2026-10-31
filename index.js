const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const express = require("express");
const app = express();
const DB_PATH = path.join(__dirname, "data/art.db");

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Database opened successfully");
    }
});

app.get("/api/eras", async (req, resp) => {
    let sql = "SELECT * FROM Eras";

    await db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        if (!rows || rows.length === 0) {
            resp.status(404).send({ error: "No eras found" });
            return;
        } else {
            resp.json(rows);
        }
    });


});

app.get("/api/galleries", async (req, resp) => {
    let sql = "SELECT * FROM Galleries;";

    await db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        if (!rows || rows.length === 0) {
            resp.status(404).send({ error: "No galleries found" });
            return;
        } else {
            resp.json(rows);
        }
    });


});

app.get("/api/galleries/:id", async (req, resp) => {
    let sql = "SELECT * FROM Galleries WHERE galleryId = ? ";

    await db.all(sql, [req.params.id], (err, rows) => {
        if (err) {
            throw err;
        }
        if (!rows || rows.length === 0) {
            resp
                .status(404)
                .send({
                    error: "No galleries found must be a positive number within range",
                });
            return;
        } else {
            resp.json(rows);
        }
    });


});
app.get("/api/artists", async (req, resp) => {
    let sql = "SELECT * FROM Artists;";

    await db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        if (!rows || rows.length === 0) {
            resp.status(404).send({ error: "No artists found" });
            return;
        } else {
            resp.json(rows);
        }
    });


});
app.get("/api/artists/:ref", (req, resp) => {
    let sql = `
        SELECT *
        FROM Artists
        WHERE ArtistID = ?;
    `;

    let artistId = Number(req.params.ref);

    if (!Number.isSafeInteger(artistId) || artistId <= 0) {
        resp.status(400).send({
            error: "Invalid artist ID"
        });
        return;
    }

    db.get(sql, [artistId], (err, row) => {
        if (err) {
            resp.status(500).send({ error: err.message });
            return;
        }

        if (!row) {
            resp.status(404).send({
                error: "Artist not found"
            });
            return;
        }

        resp.json(row);
    });
});
app.get("/api/artist/search/:ref", (req, resp) => {
    let sql = `
        SELECT *
        FROM Artists
        WHERE LastName LIKE ?;
    `;

    let search = req.params.ref + "%";

    db.all(sql, [search], (err, rows) => {
        if (err) {
            resp.status(500).send({ error: err.message });
            return;
        }

        if (!rows || rows.length === 0) {
            resp.status(404).send({
                error: "No artists found matching " + req.params.ref
            });
            return;
        }

        resp.json(rows);
    });
});

app.get("/api/galleries/country/:subs", async (req, resp) => {
    let sql = "SELECT * FROM Galleries WHERE GalleryCountry LIKE ?";

    await db.all(sql, [req.params.subs + "%"], (err, rows) => {
        if (err) {
            throw err;
        }
        if (!rows || rows.length === 0) {
            resp
                .status(404)
                .send({ error: "No galleries found for the specified country" });
            return;
        } else {
            resp.json(rows);
        }
    });


});

app.get("/api/artists/country/:subs", async (req, resp) => {
    let sql = "SELECT * FROM Artists WHERE Nationality LIKE ?";

    await db.all(sql, [req.params.subs + "%"], (err, rows) => {
        if (err) {
            throw err;
        }
        if (!rows || rows.length === 0) {
            resp
                .status(404)
                .send({ error: "No artists found with the specified nationality" });
            return;
        } else {
            resp.json(rows);
        }
    });


});
//this sql query uses a left join to avoid excluding genres with missing information
app.get("/api/genres", async (req, resp) => {
    let sql =
        "SELECT Genres.*, Eras.* FROM Genres LEFT JOIN Eras ON Genres.EraID = Eras.EraID";

    await db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        if (!rows || rows.length === 0) {
            resp.status(404).send({ error: "No genres found" });
            return;
        } else {
            resp.json(rows);
        }
    });


});

app.get("/api/genres/:ref", (req, resp) => {
    let sql = `
        SELECT Genres.*, Eras.*
        FROM Genres
        LEFT JOIN Eras
            ON Genres.EraID = Eras.EraID
        WHERE Genres.GenreID = ?;
    `;

    let genreId = Number(req.params.ref);

    if (!Number.isSafeInteger(genreId) || genreId <= 0) {
        resp.status(400).send({
            error: "Invalid genre ID"
        });
        return;
    }

    db.get(sql, [genreId], (err, row) => {
        if (err) {
            resp.status(500).send({ error: err.message });
            return;
        }

        if (!row) {
            resp.status(404).send({
                error: "Genre not found"
            });
            return;
        }

        resp.json(row);
    });
});

app.get("/api/paintings/single/:ref", (req, resp) => {
    let sql = `
        SELECT Paintings.*, Artists.*, Galleries.*
        FROM Paintings
        LEFT JOIN Artists
            ON Paintings.ArtistID = Artists.ArtistID
        LEFT JOIN Galleries
            ON Paintings.GalleryID = Galleries.GalleryID
        WHERE Paintings.PaintingID = ?;
    `;

    let paintingId = Number(req.params.ref);

    if (!Number.isSafeInteger(paintingId) || paintingId <= 0) {
        resp.status(400).send({
            error: "Invalid painting ID"
        });
        return;
    }

    db.get(sql, [paintingId], (err, row) => {
        if (err) {
            resp.status(500).send({ error: err.message });
            return;
        }

        if (!row) {
            resp.status(404).send({
                error: "Painting not found"
            });
            return;
        }

        resp.json(row);
    });
});
app.get("/api/genres/painting/:ref", (req, resp) => {
    let sql = `
        SELECT Genres.*, Eras.*
        FROM Genres
        JOIN PaintingGenres
            ON Genres.GenreID = PaintingGenres.GenreID
        LEFT JOIN Eras
            ON Genres.EraID = Eras.EraID
        WHERE PaintingGenres.PaintingID = ?
        ORDER BY Genres.GenreName ASC;
    `;

    let paintingId = Number(req.params.ref);

    if (!Number.isSafeInteger(paintingId) || paintingId <= 0) {
        resp.status(400).send({
            error: "Invalid painting ID"
        });
        return;
    }

    db.all(sql, [paintingId], (err, rows) => {
        if (err) {
            resp.status(500).send({ error: err.message });
            return;
        }

        if (!rows || rows.length === 0) {
            resp.status(404).send({
                error: "No genres found for painting " + paintingId
            });
            return;
        }

        resp.json(rows);
    });
});

app.get("/api/paintings/sort/:sType/limit/:ref", (req, resp) => {
    let sql = `
        SELECT Paintings.*, Artists.*, Galleries.*
        FROM Paintings
        LEFT JOIN Artists
            ON Paintings.ArtistID = Artists.ArtistID
        LEFT JOIN Galleries
            ON Paintings.GalleryID = Galleries.GalleryID
        ORDER BY
            CASE WHEN ? = 'title' THEN Paintings.Title END ASC,
            CASE WHEN ? = 'year' THEN Paintings.YearOfWork END ASC
        LIMIT ?;
    `;

    let sort = req.params.sType;
    let limit = Number(req.params.ref);

    // Validate sort type
    if (sort !== 'title' && sort !== 'year') {
        resp.status(400).send({
            error: "Invalid sort type. Must be 'title' or 'year'."
        });
        return;
    }

    // Validate limit
    if (!/^\d+$/.test(req.params.ref) ||
        !Number.isSafeInteger(limit)) {
        resp.status(400).send({
            error: "Limit must be a non-negative integer."
        });
        return;
    }

    // If limit is 0, return all paintings
    if (limit === 0) {
        limit = -1;
    }

    db.all(sql, [sort, sort, limit], (err, rows) => {
        if (err) {
            resp.status(500).send({
                error: err.message
            });
            return;
        }

        if (!rows || rows.length === 0) {
            resp.status(404).send({
                error: "No paintings found."
            });
            return;
        }

        resp.json(rows);
    });
});

app.get(
    "/api/paintings/sort/:sType/limit/:ref/skip/:offset",
    async (req, resp) => {
        let sql = `
    SELECT Paintings.*, Artists.*, Galleries.*
    FROM Paintings
    LEFT JOIN Artists
        ON Paintings.ArtistID = Artists.ArtistID
    LEFT JOIN Galleries
        ON Paintings.GalleryID = Galleries.GalleryID
    ORDER BY
        CASE WHEN ? = 'title' THEN Paintings.Title END ASC,
        CASE WHEN ? = 'year' THEN Paintings.YearOfWork END ASC
    LIMIT ?
    OFFSET ?;
`;
        let lim = Number(req.params.ref);
        if (req.params.sType !== "title" && req.params.sType !== "year") {
            resp
                .status(400)
                .send({ error: "Invalid sort type. Must be 'title' or 'year'." });
            return;
        }
        if (Number(req.params.ref) < 0 || Number(req.params.offset) < 0) {
            resp
                .status(400)
                .send({ error: "Limit and offset must be positive numbers." });
            return;
        }
        if (lim === 0) {
            lim = -1;
            console.log(lim);
        }

        await db.all(
            sql,
            [req.params.sType, req.params.sType, lim, req.params.offset],
            (err, rows) => {
                if (err) {
                    throw err;
                }
                if (!rows || rows.length === 0) {
                    resp.status(404).send({ error: "No paintings found " });
                    return;
                } else {
                    resp.json(rows);
                }
            },
        );


    },
);

app.get("/api/paintings/search/:subs", async (req, resp) => {
    let sql = `
        SELECT Paintings.*, Artists.*, Galleries.*
        FROM Paintings
        LEFT JOIN Artists
            ON Paintings.ArtistID = Artists.ArtistID
        LEFT JOIN Galleries
            ON Paintings.GalleryID = Galleries.GalleryID
        WHERE Paintings.Title LIKE ?
        ORDER BY Paintings.YearOfWork ASC;
    `;

    await db.all(sql, ["%" + req.params.subs + "%"], (err, rows) => {
        if (err) {
            throw err;
        }
        if (!rows || rows.length === 0) {
            resp
                .status(404)
                .send({ error: "No paintings found with that substring" });
            return;
        } else {
            resp.json(rows);
        }
    });


});

app.get("/api/paintings/years/:start/:end", async (req, resp) => {
    let sql = `
        SELECT Paintings.*, Artists.*, Galleries.*
FROM Paintings
LEFT JOIN Artists
    ON Paintings.ArtistID = Artists.ArtistID
LEFT JOIN Galleries
    ON Paintings.GalleryID = Galleries.GalleryID
WHERE Paintings.YearOfWork BETWEEN ? AND ?
ORDER BY Paintings.YearOfWork ASC;
    `;
    if (Number(req.params.start) > Number(req.params.end)) {
        resp
            .status(400)
            .send({ error: "Start year must be less than or equal to end year" });
        return;
    }

    if (Number(req.params.start) < 0 || Number(req.params.end) < 0) {
        resp.status(400).send({ error: "Years must be positive numbers" });
        return;
    }
    await db.all(sql, [req.params.start, req.params.end], (err, rows) => {
        if (err) {
            throw err;
        }


        if (!rows || rows.length === 0) {
            resp.status(404).send({ error: "No paintings found in that year range" });
            return;
        } else {
            resp.json(rows);
        }
    });

});
app.get("/api/paintings/galleries/:id", async (req, resp) => {
    let sql = `
        SELECT Paintings.*, Artists.*, Galleries.*
        FROM Paintings
        LEFT JOIN Artists
            ON Paintings.ArtistID = Artists.ArtistID
        LEFT JOIN Galleries
            ON Paintings.GalleryID = Galleries.GalleryID
        WHERE Paintings.GalleryID = ?
        ORDER BY Paintings.YearOfWork ASC;
    `;

    await db.all(sql, [req.params.id], (err, rows) => {
        if (err) {
            throw err;
        }


        if (!rows || rows.length === 0) {
            resp.status(404).send({ error: "No paintings found in that gallery" });
            return;
        } else {
            resp.json(rows);
        }
    });


});

app.get("/api/paintings/artist/:ref", (req, resp) => {
    let sql = `
        SELECT Paintings.*, Artists.*, Galleries.*
        FROM Paintings
        LEFT JOIN Artists
            ON Paintings.ArtistID = Artists.ArtistID
        LEFT JOIN Galleries
            ON Paintings.GalleryID = Galleries.GalleryID
        WHERE Paintings.ArtistID = ?
        ORDER BY Paintings.YearOfWork ASC;
    `;

    let artistId = Number(req.params.ref);

    if (!Number.isSafeInteger(artistId) || artistId <= 0) {
        resp.status(400).send({
            error: "Invalid artist ID"
        });
        return;
    }

    db.all(sql, [artistId], (err, rows) => {
        if (err) {
            resp.status(500).send({ error: err.message });
            return;
        }

        if (!rows || rows.length === 0) {
            resp.status(404).send({
                error: "No paintings found for artist " + artistId
            });
            return;
        }

        resp.json(rows);
    });

});

app.get("/api/paintings/era/:ref", (req, resp) => {
    let sql = `
        SELECT DISTINCT Paintings.PaintingID, Paintings.Title, Paintings.YearOfWork
        FROM Paintings
        JOIN PaintingGenres
            ON Paintings.PaintingID = PaintingGenres.PaintingID
        JOIN Genres
            ON PaintingGenres.GenreID = Genres.GenreID
        JOIN Eras
            ON Genres.EraID = Eras.EraID
        WHERE Eras.EraID = ?
        ORDER BY Paintings.YearOfWork ASC;
    `;

    let eraId = Number(req.params.ref);

    if (!Number.isSafeInteger(eraId) || eraId <= 0) {
        resp.status(400).send({
            error: "Invalid era ID"
        });
        return;
    }

    db.all(sql, [eraId], (err, rows) => {
        if (err) {
            resp.status(500).send({ error: err.message });
            return;
        }

        if (!rows || rows.length === 0) {
            resp.status(404).send({
                error: "No paintings found for era " + eraId
            });
            return;
        }

        resp.json(rows);
    });
});
app.get("/api/counts/genres", (req, resp) => {
    let sql = `
        SELECT Genres.GenreName,
               COUNT(PaintingGenres.PaintingID) AS PaintingCount
        FROM Genres
        LEFT JOIN PaintingGenres
            ON Genres.GenreID = PaintingGenres.GenreID
        GROUP BY Genres.GenreID, Genres.GenreName
        ORDER BY PaintingCount ASC;
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            resp.status(500).send({ error: err.message });
            return;
        }

        resp.json(rows);
    });
});
app.get("/api/counts/artists", (req, resp) => {
    let sql = `
        SELECT
            Artists.FirstName || ' ' || Artists.LastName AS ArtistName,
            COUNT(Paintings.PaintingID) AS PaintingCount
        FROM Artists
        LEFT JOIN Paintings
            ON Artists.ArtistID = Paintings.ArtistID
        GROUP BY Artists.ArtistID, Artists.FirstName, Artists.LastName
        ORDER BY PaintingCount DESC;
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            resp.status(500).send({ error: err.message });
            return;
        }

        resp.json(rows);
    });
});



app.get("/api/counts/topgenres/:ref", (req, resp) => {
    let sql = `
        SELECT
            Genres.GenreName,
            COUNT(PaintingGenres.PaintingID) AS PaintingCount
        FROM Genres
        JOIN PaintingGenres
            ON Genres.GenreID = PaintingGenres.GenreID
        GROUP BY Genres.GenreID, Genres.GenreName
        HAVING COUNT(PaintingGenres.PaintingID) > ?
        ORDER BY PaintingCount DESC;
    `;

    let minCount = Number(req.params.ref);

    if (!Number.isSafeInteger(minCount) || minCount < 0) {
        resp.status(400).send({
            error: "Invalid painting count"
        });
        return;
    }

    db.all(sql, [minCount], (err, rows) => {
        if (err) {
            resp.status(500).send({ error: err.message });
            return;
        }

        if (!rows || rows.length === 0) {
            resp.status(404).send({
                error: "No genres found with more than " + minCount + " paintings"
            });
            return;
        }

        resp.json(rows);
    });
});


process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }

        process.exit(err ? 1 : 0);
    });
});
app.listen(process.env.PORT || 8080, () =>
    console.log("server on " + process.env.port),
);
