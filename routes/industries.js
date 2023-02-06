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



module.exports = router;