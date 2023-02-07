/** Routes for industries of biztime */

const express = require("express");
const slugify = require("slugify");
const { route } = require("../app");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.post("/", async (req, res, next) => {
    try {
        if (!req.body.industry) {
            throw new ExpressError(`industry is required`, 400);
        }
        const {industry} = req.body;
        let {code} = req.body;
        // regex in remove borrowed from slugify documentation
        code = (code === undefined) ? slugify(industry, {
            remove: /[*+~.()'"!:@^%&]/g,
            replacement: '',
            lower: true
        }) : code;
        const results = await db.query(`
            INSERT INTO industries (code, industry)
            VALUES ($1, $2)
            RETURNING code, industry
        `, [code, industry]);
        return res.status(201).json({industry: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

router.get("/", async (req, res, next) => {
    try {
        const indResults = await db.query(`
            SELECT i.industry, c.name
            FROM industries AS i
            LEFT JOIN company_industries AS ci
            ON ci.ind_code = i.code
            LEFT JOIN companies AS c
            ON ci.comp_code = c.code;`);
        let results = {};
        indResults.rows.forEach(r => {
            if (!results[r.industry]) {
                results[r.industry] = [r.name];
            } else {
                results[r.industry].push(r.name);
            }
        });
        return res.json({industries: results});
    } catch (err) {
        return next(err);
    }
});

router.post("/addcompany", async (req, res, next) => {
    // Add a company-industry relationship
    try {
        if (!req.body.company || !req.body.industry) throw new ExpressError(`company and industry are required`, 404);
        const {company, industry} =  req.body;
        const results = await db.query(`
            INSERT INTO company_industries VALUES ($1, $2)
            RETURNING comp_code, ind_code
        `, [company, industry]);
        return res.json({added: results.rows[0]});
    } catch (err) {
        if (err.constraint === "no_dups") {
            return res.json({message: "Relationship already exists"});
        } else if (err.constraint === "company_industries_ind_code_fkey") {
            return res.json({error: "Industry code does not exist."});
        } else if (err.constraint === "company_industries_comp_code_fkey") {
            return res.json({error: "Company code does not exist."});
        }
        return next(err);
    }
});

module.exports = router;