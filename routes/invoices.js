/** Routes for invoices of biztime */

const express = require("express");
const { route } = require("../app");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({invoices: results.rows});
    } catch (err) {
        return next(err);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const {id} = req.params;
        const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Cannot find invoice with id of ${id}`, 404);
        }
        return res.send({invoice: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

router.post("/", async (req, res, next) => {
    try {
        if (!req.body.comp_code || !req.body.amt) {
            throw new ExpressError(`comp_code and amt are required`, 400);
        }
        const {comp_code, amt} = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [comp_code, amt]);
        return res.status(201).json({invoice: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

router.put("/:id", async (req, res, next) => {
    try {
        if (!req.body.amt) {
            throw new ExpressError(`amt is required`, 404);
        }
        const {id} = req.params;
        const {amt, paid} = req.body;
        let results;
        if (paid) {
            const currDate = new Date().toISOString().slice(0, 10);
            results = await db.query(`UPDATE invoices SET paid=$1, paid_date=$2
            WHERE id=$3 RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [true, currDate, id]);
        } else {
            results = await db.query(`UPDATE invoices SET paid=$1, paid_date=$2
            WHERE id=$3 RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [false, null, id]);
        }
        if (results.rows.length === 0) {
            throw new ExpressError(`Cannot find invoice with id of ${id}`, 404);
        }
        return res.send({invoice: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const {id} = req.params;
        const results = await db.query(`DELETE FROM invoices WHERE id=$1`, [id]);
        if (results.rowCount === 0) {
            throw new ExpressError(`Cannot find invoice with id of ${id}`, 404);
        }
        return res.send({status: "deleted"});
    } catch (err) {
        return next(err);
    }
});

module.exports = router;