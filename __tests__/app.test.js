const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection");
const data = require("../db/data/test-data");

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
