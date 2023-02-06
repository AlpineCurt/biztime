/** Routes for companies of biztime */

const express = require("express");
const slugify = require("slugify");
const { route } = require("../app");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({companies: results.rows});
    } catch (err) {
        return next(err);
    }
});

router.get("/:code", async (req, res, next) => {
    try {
        const {code} = req.params;
        const companyResults = await db.query(`SELECT code, name, description FROM companies WHERE code=$1`, [code]);
        const indResults = await db.query(`
            SELECT i.industry
            FROM industries AS i
            LEFT JOIN company_industries as ci
            ON ci.ind_code = i.code
            WHERE ci.comp_code = $1
        `, [code]);
        const company = companyResults.rows[0];
        company.industries = indResults.rows.map(r => r.industry);
        if (companyResults.rows.length === 0) {
            throw new ExpressError(`Cannot find company with code of ${code}`, 404);
        }
        return res.send({company: company});
    } catch (err) {
        return next(err);
    }
});

router.post("/", async (req, res, next) => {
    try {
        if (!req.body.name) {
            throw new ExpressError(`name is required`, 400);
        }
        let {code, name, description} = req.body;
        // regex in remove borrowed from slugify documentation
        code = (code === undefined) ? slugify(name, {
            remove: /[*+~.()'"!:@^%&]/g,
            replacement: '',
            lower: true
        }) : code;
        const results = await db.query(`INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json({company: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

router.put("/:code", async (req, res, next) => {
    try {
        if (!req.body.name || !req.body.description) {
            throw new ExpressError(`name and description are required`, 404);
        }
        const {code} = req.params;
        const {name, description} = req.body;
        const results = await db.query(`UPDATE companies SET name=$1, description=$2
        WHERE code=$3 RETURNING code, name, description`, [name, description, code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Cannot find company with code of ${code}`, 404);
        }
        return res.send({company: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

router.delete("/:code", async (req, res, next) => {
    try {
        const {code} = req.params;
        const results = await db.query(`DELETE FROM companies WHERE code=$1`, [code]);
        if (results.rowCount === 0) {
            throw new ExpressError(`Cannot find company with code of ${code}`, 404);
        }
        return res.send({status: "deleted"});
    } catch (err) {
        return next(err);
    }
});

module.exports = router;