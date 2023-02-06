process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

const defaultCompanies = {
    "companies": [
        {
            "code": "apple",
            "name": "Apple Computer",
            "description": "Maker of OSX."
        },
        {
            "code": "ibm",
            "name": "IBM",
            "description": "Big blue."
        }
    ]
};

const facebook = {
    "code": "fb",
    "name": "Facebook",
    "description": "Big Brother"
};

afterAll(async () => {
    await db.query(`DELETE FROM companies WHERE code='fb'`);
    db.end();
});

// afterEach(async () => {
//     //await db.query(`DELETE FROM companies WHERE code='fb'`);
// });

describe("GET /companies", () => {
    test("Get all companies", async () => {
        const res = await request(app).get("/companies");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(defaultCompanies);
    });
});

describe("POST /companies", () => {
    test("Add company to db", async () => {
        const res = await request(app).post("/companies").send(facebook);
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({company: facebook});
    });
});



describe("DELETE /companies/:id", () => {
    test("Delete company from db", async () => {
        const res = await request(app).delete("/companies/fb");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({status: "deleted"});
        // Verify it has been deleted
        const res2 = await request(app).delete("/companies/fb");
        expect(res2.statusCode).toBe(404);
    });
});