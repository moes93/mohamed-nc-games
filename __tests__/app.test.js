const app = require ("../app");
const app = require("../app");
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

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  db.end();
});

describe("GET api/categories", () => {
  test("To return a status code of 200 and with an array of objects with a key of slug and a key of description", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then(({ body }) => {
        body["categories"].forEach((catergory) => {
          expect(catergory).toHaveProperty("slug");
          expect(catergory).toHaveProperty("description");
        });
      });
  });
});

describe("GET /api/reviews", () => {
  test("To return the array of objects with all the properties and correct keys", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body }) => {
        allReviews = body.reviews;
        allReviews.forEach((review) => {
          expect(review).toHaveProperty("review_id", expect.any(Number));
          expect(review).toHaveProperty("title", expect.any(String));
          expect(review).toHaveProperty("designer", expect.any(String));
          expect(review).toHaveProperty("owner", expect.any(String));
          expect(review).toHaveProperty("review_img_url", expect.any(String));
          expect(review).toHaveProperty("comment_count", expect.any(Number));
          expect(review).toHaveProperty("category", expect.any(String));
          expect(review).toHaveProperty("created_at", expect.any(String));
          expect(review).toHaveProperty("votes", expect.any(Number));
        });
      });
  });
  test("Should respond the value that matches the length and descending order of the test data", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body }) => {
        const reviewsArr = body.reviews;
        expect(body.reviews.length).toBe(13);
        expect(reviewsArr).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/reviews/:review_id", () => {
  test("A review object, which should have the following properties: review_id,title,review_body,designer,review_img_url,votes, category, owner and created_at", () => {
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then(({ body }) => {
        const review = body.review;
        expect(review).toHaveProperty("review_id", expect.any(Number));
        expect(review).toHaveProperty("review_body", expect.any(String));
        expect(review).toHaveProperty("title", expect.any(String));
        expect(review).toHaveProperty("designer", expect.any(String));
        expect(review).toHaveProperty("owner", expect.any(String));
        expect(review).toHaveProperty("review_img_url", expect.any(String));
        expect(review).toHaveProperty("category", expect.any(String));
        expect(review).toHaveProperty("created_at", expect.any(String));
        expect(review).toHaveProperty("votes", expect.any(Number));
      });
  });
  test("when given a review_id that's too high, return an appropriate error", () => {
    return request(app)
      .get("/api/reviews/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No review found");
      });
  });
  test("when given an invalid review_id, return an appropriate error", () => {
    return request(app)
      .get("/api/reviews/banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("ID must be a number");
      });
  });
});


describe("POST /api/reviews/:review_id/comments", () => {
  test("request body accepts an object with the keys username and body and responds with all the properties and correct keys", () => {
    const postedComment = { username: "mallionaire", body: "random words" };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(postedComment)
      .expect(201)
      .then(({ body }) => {
        const expected = {
          body: "random words",
          author: "mallionaire",
        };
        expect(body.comment).toEqual(expect.objectContaining(expected));

        const comment = body.comment;
        expect(comment).toHaveProperty("review_id", expect.any(Number));
        expect(comment).toHaveProperty("author", expect.any(String));
        expect(comment).toHaveProperty("body", expect.any(String));
        expect(comment).toHaveProperty("comment_id", expect.any(Number));
        expect(comment).toHaveProperty("created_at", expect.any(String));
        expect(comment).toHaveProperty("votes", expect.any(Number));
      });
  });
  test("if given a review_id that's too high, return an appropriate response", () => {
    const postedComment = { username: "mohamed", body: "random words" };
    return request(app)
      .post("/api/reviews/1000/comments")
      .send(postedComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Username Not Found");
      });
  });
  test("if given an invalid Id, return an appropriate response", () => {
    const postedComment = { username: "Mohamed", body: "random words" };
    return request(app)
      .post("/api/reviews/banana/comments")
      .send(postedComment)
      .expect(400)
      .then(({ body }) => {
        console.log(body);
        expect(body.msg).toBe("ID must be a number");
      });
  });
  test("if given an invalid username, return an appropriate response", () => {
    const postedComment = { username: "malek", body: "random words" };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(postedComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Username Not Found");
      });
  });

describe("GET /api/reviews/:review_id", () => {
  test("A review object, which should have the following properties: review_id,title,review_body,designer,review_img_url,votes, category, owner and created_at", () => {
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then(({ body }) => {
        const review = body.review;
        expect(review).toHaveProperty("review_id", expect.any(Number));
        expect(review).toHaveProperty("review_body", expect.any(String));
        expect(review).toHaveProperty("title", expect.any(String));
        expect(review).toHaveProperty("designer", expect.any(String));
        expect(review).toHaveProperty("owner", expect.any(String));
        expect(review).toHaveProperty("review_img_url", expect.any(String));
        expect(review).toHaveProperty("category", expect.any(String));
        expect(review).toHaveProperty("created_at", expect.any(String));
        expect(review).toHaveProperty("votes", expect.any(Number));
      });
  });
  test("when given a review_id that's too high, return an appropriate error", () => {
    return request(app)
      .get("/api/reviews/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No review found");
      });
  });
  test("when given an invalid review_id, return an appropriate error", () => {
    return request(app)
      .get("/api/reviews/banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("ID must be a number");
      });
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
  test("To return the array of coment objects with all the properties and correct keys of comments sorted by most recent frst", () => {
    return request(app)
      .get("/api/reviews/3/comments")
      .expect(200)
      .then(({ body }) => {
        allcomments = body.comments;
        expect(allcomments).toBeSortedBy("created_at", { descending: true });
        allcomments.forEach((comment) => {
          expect(comment).toHaveProperty("review_id", expect.any(Number));
          expect(comment).toHaveProperty("body", expect.any(String));
          expect(comment).toHaveProperty("author", expect.any(String));
          expect(comment).toHaveProperty("created_at", expect.any(String));
          expect(comment).toHaveProperty("votes", expect.any(Number));
          expect(comment).toHaveProperty("comment_id", expect.any(Number));
        });
      });
  });
  test("Return an appropriate response, when given an invalid review_id", () => {
    return request(app)
      .get("/api/reviews/4/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).toBe("No comment related");
      });
  });
  test("Return an appropriate response, when given a review_id that's too high", () => {
    return request(app)
      .get("/api/reviews/9999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No review found");
      });
  });
  test("Return an appropriate response, when given an invalid review_id", () => {
    return request(app)
      .get("/api/reviews/banana/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("ID must be a number");
      });
  });
});

describe("PATCH /api/reviews/:review_id", () => {
  test("updates the vote count by adding if inc_votes is positive and returns the updated review", () => {
    return request(app)
      .patch("/api/reviews/1")
      .send({ inc_votes: 5 })
      .then(({ body }) => {
        const expected = {
          review_id: 1,
          title: "Agricola",
          designer: "Uwe Rosenberg",
          owner: "mallionaire",
          review_img_url:
            "https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700",
          review_body: "Farmyard fun!",
          category: "euro game",
          created_at: "2021-01-18T10:00:20.514Z",
          votes: 6,
        };
        expect(body.review).toEqual(expected);
      });
  });
  test("updates the vote count by subtraction if inc_votes is negatives and returns the updated review", () => {
    return request(app)
      .patch("/api/reviews/1")
      .send({ inc_votes: -1 })
      .then(({ body }) => {
        const expected = {
          review_id: 1,
          title: "Agricola",
          designer: "Uwe Rosenberg",
          owner: "mallionaire",
          review_img_url:
            "https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700",
          review_body: "Farmyard fun!",
          category: "euro game",
          created_at: "2021-01-18T10:00:20.514Z",
          votes: 0,
        };
        expect(body.review).toEqual(expected);
      });
  });
  test("when given a review_id that's too high, return an appropriate error", () => {
    return request(app)
      .patch("/api/reviews/90")
      .send({ inc_votes: 5 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No review found");
      });
  });
  test("when given an invalid review_id, return an appropriate error", () => {
    return request(app)
      .patch("/api/reviews/banana")
      .send({ inc_votes: 5 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("ID must be a number");
      });
  });
  test("when given an invalid inc_votes input, return an appropriate error", () => {
    return request(app)
      .patch("/api/reviews/1")
      .send({ inc_votes: "apple" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("ID must be a number");
      });
  });
});
