const app = require ("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection");
const data = require("../db/data/test-data");

beforeEach(()=>{
    return seed(data);
});

afterAll(()=>{
    db.end();
});

describe("get api/categories",()=>{
    test("To return a status code of 200 and with an array of objects with a key of slug and a key of description", ()=>{
        return request(app)
        .get("/api/categories")
        .expect(200)
        .then(({body})=>{
          console.log(body.categories)
          expect(body.categories.length).toBe(4);
            body["categories"].forEach((catergory)=>{
                expect(catergory).toHaveProperty("slug");
                expect(catergory).toHaveProperty("description");
            })
        })
    })
})

