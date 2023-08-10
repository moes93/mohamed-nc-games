const request = require("supertest");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const testData = require("../db/data/test-data/index");
const app = require("../app");
const jasonEndpoints = require("../endpoints.json");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("404 /notExistingPath", () => {
  it("404: should respond with 404 path not found", () => {
    return request(app)
      .get("/wrongEndpoint")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Path not found");
      });
  });
});
//
describe("GET /api/categories", () => {
  it("200: should respond with category objects array, which should have slug and description properties", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then(({ body }) => {
        expect(typeof body).toBe("object");
        const { categories } = body;
        expect(body).toHaveProperty("categories");
        expect(body.categories).toBeInstanceOf(Array);
        expect(categories.length).toBe(4);
        categories.forEach((category) => {
          expect(category).toHaveProperty("slug", expect.any(String));
          expect(category).toHaveProperty("description", expect.any(String));
        });
      });
  });
});
//
describe("GET /api/reviews", () => {
  it("200: should respond with review objects array, which should have 9 properties and sorted by date desc", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body }) => {
        expect(typeof body).toBe("object");
        expect(body).toHaveProperty("reviews");
        const { reviews } = body;
        expect(body.reviews).toBeInstanceOf(Array);
        // expect(reviews.length).toBe(13); <----- default to 10 now, because of pagination
        reviews.forEach((review) => {
          expect(review).toHaveProperty("owner", expect.any(String));
          expect(review).toHaveProperty("title", expect.any(String));
          expect(review).toHaveProperty("review_id", expect.any(Number));
          expect(review).toHaveProperty("category", expect.any(String));
          expect(review).toHaveProperty("review_img_url", expect.any(String));
          expect(review).toHaveProperty("created_at", expect.any(String));
          expect(review).toHaveProperty("votes", expect.any(Number));
          expect(review).toHaveProperty("designer", expect.any(String));
          expect(review).toHaveProperty("comment_count", expect.any(String));
        });
        expect(reviews).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
});
//
describe("GET /api/reviews/:review_id", () => {
  it("200: should respond with review object, which should have 10 properties", () => {
    return request(app)
      .get("/api/reviews/1")
      .expect(200)
      .then(({ body }) => {
        const { review } = body;
        expect(typeof review).toBe("object");
        expect(review).toHaveProperty("review_id", expect.any(Number));
        expect(review.review_id).toBe(1);
        expect(review).toHaveProperty("title", expect.any(String));
        expect(review.title).toBe("Agricola");
        expect(review).toHaveProperty("review_body", expect.any(String));
        expect(review).toHaveProperty("designer", expect.any(String));
        expect(review).toHaveProperty("review_img_url", expect.any(String));
        expect(review).toHaveProperty("votes", expect.any(Number));
        expect(review).toHaveProperty("category", expect.any(String));
        expect(review).toHaveProperty("owner", expect.any(String));
        expect(review).toHaveProperty("created_at", expect.any(String));
        expect(review).toHaveProperty("comment_count", expect.any(String));
      });
  });
  //
  it("400: should respond with 400 bad request", () => {
    return request(app)
      .get("/api/reviews/banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  //
  it("404: should respond with 404 not existent review_id", () => {
    return request(app)
      .get("/api/reviews/100")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("valid but not existent review_id");
      });
  });
});
//
describe("GET /api/reviews/:review_id/comments", () => {
  it("200: should respond comments array for the given review_id, which should have 6 properties each", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body).toHaveProperty("comments");
        const { comments } = body;
        expect(body.comments).toBeInstanceOf(Array);
        expect(comments.length).toBe(3);
        comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id", expect.any(Number));
          expect(comment).toHaveProperty("votes", expect.any(Number));
          expect(comment).toHaveProperty("created_at", expect.any(String));
          expect(comment).toHaveProperty("author", expect.any(String));
          expect(comment).toHaveProperty("body", expect.any(String));
          expect(comment).toHaveProperty("review_id", expect.any(Number));
        });
        expect(comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  //
  it("200: should respond with empty array if review has no comments", () => {
    return request(app)
      .get("/api/reviews/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(0);
      });
  });
  //
  it("400: should respond with 400 bad request if review id is not a number", () => {
    return request(app)
      .get("/api/reviews/banana/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  //
  it("404: should respond with 404 not existent review_id", () => {
    return request(app)
      .get("/api/reviews/100/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("valid but not existent review_id");
      });
  });
});
//
describe("POST /api/reviews/:review_id/comments", () => {
  it("201: should accept object with username and body and respond with posted comment", () => {
    const review_id = 1;
    const newComment = {
      username: "mallionaire",
      body: "what an awesome comment",
    };
    return request(app)
      .post(`/api/reviews/${review_id}/comments`)
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toHaveProperty("comment_id", expect.any(Number));
        expect(comment).toHaveProperty("votes", 0);
        expect(comment).toHaveProperty("created_at", expect.any(String));
        expect(comment).toHaveProperty("author", "mallionaire");
        expect(comment).toHaveProperty("body", "what an awesome comment");
        expect(comment).toHaveProperty("review_id", review_id);
      });
  });
  //
  it("400: should respond with 400 bad request if review id is not a number", () => {
    const review_id = "banana";
    const newComment = {
      username: "mallionaire",
      body: "what an awesome comment",
    };
    return request(app)
      .post(`/api/reviews/${review_id}/comments`)
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  //
  it("400: should respond with 400 if new comment has got missing body key", () => {
    const review_id = 1;
    const newComment = {
      username: "mallionaire",
    };
    return request(app)
      .post(`/api/reviews/${review_id}/comments`)
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("missing or wrong request keys");
      });
  });
  //
  it("404: should respond with 404 not found review_id", () => {
    const review_id = 100;
    const newComment = {
      username: "mallionaire",
      body: "what an awesome comment",
    };
    return request(app)
      .post(`/api/reviews/${review_id}/comments`)
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("not found");
      });
  });
  //
  it("404: should respond with 404 not found if user does not exist", () => {
    const review_id = 1;
    const newComment = {
      username: "wrongUser",
      body: "what an awesome comment",
    };
    return request(app)
      .post(`/api/reviews/${review_id}/comments`)
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("not found");
      });
  });
});
//
describe("PATCH /api/reviews/:review_id", () => {
  it("200: should accept object with inc_votes and update with new vote in review", () => {
    const review_id = 1;
    const newComment = {
      inc_votes: 1,
    };
    return request(app)
      .patch(`/api/reviews/${review_id}`)
      .send(newComment)
      .expect(200)
      .then(({ body }) => {
        const { review } = body;
        expect(review).toHaveProperty("review_id", review_id);
        expect(review).toHaveProperty("title", "Agricola");
        expect(review).toHaveProperty("designer", "Uwe Rosenberg");
        expect(review).toHaveProperty("owner", "mallionaire");
        expect(review).toHaveProperty("review_img_url", expect.any(String));
        expect(review).toHaveProperty("review_body", "Farmyard fun!");
        expect(review).toHaveProperty("category", "euro game");
        expect(review).toHaveProperty("created_at", expect.any(String));
        expect(review).toHaveProperty("votes", 2);
      });
  });
  //
  it("400: should respond with 400 bad request if review id is not a number", () => {
    const review_id = "banana";
    const newComment = {
      inc_votes: 1,
    };
    return request(app)
      .patch(`/api/reviews/${review_id}`)
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  //
  it("400: should respond with 400 if new comment has not got right keys", () => {
    const review_id = 1;
    const newComment = {
      wrongKey: 1,
    };
    return request(app)
      .patch(`/api/reviews/${review_id}`)
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("missing or wrong request keys");
      });
  });
  //
  it("400: should respond with 400 bad request if new comment has not got right key value type", () => {
    const review_id = 1;
    const newComment = {
      inc_votes: "banana",
    };
    return request(app)
      .patch(`/api/reviews/${review_id}`)
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  //
  it("404: should respond with 404 not existent review_id", () => {
    const review_id = 100;
    const newComment = {
      inc_votes: 1,
    };
    return request(app)
      .patch(`/api/reviews/${review_id}`)
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("valid but not existent review_id");
      });
  });
});
//
describe("GET /api/users", () => {
  it("200: should respond with users objects array, which should have username, name and avatar_url", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(typeof body).toBe("object");
        const { users } = body;
        expect(body).toHaveProperty("users");
        expect(body.users).toBeInstanceOf(Array);
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(user).toHaveProperty("username", expect.any(String));
          expect(user).toHaveProperty("name", expect.any(String));
          expect(user).toHaveProperty("avatar_url", expect.any(String));
        });
      });
  });
});
//
describe("GET /api/reviews(queries)", () => {
  it("200: should respond with the reviews by the category value specified in the query", () => {
    const category = "euro game";
    return request(app)
      .get(`/api/reviews?category=${category}`)
      .expect(200)
      .then(({ body }) => {
        expect(typeof body).toBe("object");
        const { reviews } = body;
        reviews.forEach((review) => {
          expect(review).toHaveProperty("category", category);
        });
      });
  });
  //
  it("200: should respond with the reviews sorted by the value specified in the query default to date", () => {
    const sort_by = "votes";
    return request(app)
      .get(`/api/reviews?sort_by=${sort_by}`)
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeSortedBy(`${sort_by}`, {
          descending: true,
        });
      });
  });
  //
  it("200: should respond with the reviews sorted in asc order and the default should be desc", () => {
    const order = "asc";
    return request(app)
      .get(`/api/reviews?order=${order}`)
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeSortedBy(`created_at`, {
          descending: false,
        });
      });
  });
  //
  it("200: should respond with the reviews by category, sorted by value and in order", () => {
    const category = "social deduction";
    const sort_by = "votes";
    const order = "asc";
    return request(app)
      .get(
        `/api/reviews?category=${category}&sort_by=${sort_by}&order=${order}`
      )
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        reviews.forEach((review) => {
          expect(review).toHaveProperty("category", category);
        });
        expect(reviews).toBeSortedBy(`${sort_by}`, {
          descending: false,
        });
      });
  });
  //
  it("400: should respond with 400 if sort by is non existent", () => {
    const sort_by = "banana";
    return request(app)
      .get(`/api/reviews?sort_by=${sort_by}`)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid query");
      });
  });
  //
  it("400: should respond with 400 if order is not asc or desc", () => {
    const order = "notAscOrDesc";
    return request(app)
      .get(`/api/reviews?order=${order}`)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid query");
      });
  });
  //
  it("404: should respond with 404 if category non existent", () => {
    const category = "banana";
    return request(app)
      .get(`/api/reviews?category=${category}`)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("category does not exist");
      });
  });
});
//
describe("DELETE /api/comments/:comment_id", () => {
  it("204: should respond with 204 no content and delete the given comment by comment_id", () => {
    return request(app)
      .delete(`/api/comments/1`)
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  //
  it("400: should respond with 400 if comment if is not a number", () => {
    return request(app)
      .delete(`/api/comments/banana`)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  //
  it("404: should respond with 404 if comment_id does not exist", () => {
    return request(app)
      .delete(`/api/comments/100`)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("comment not existent");
      });
  });
});
//
describe("GET /api", () => {
  it("200: should respond with 200 and a JSON describing of all the available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const { apiEndpoints } = body;
        expect(apiEndpoints).toEqual(jasonEndpoints);
      });
  });
});
//
describe("GET /api/users/:username", () => {
  it("200: should respond with a single user object, which should have username, name and avatar_url", () => {
    return request(app)
      .get("/api/users/mallionaire")
      .expect(200)
      .then(({ body }) => {
        expect(typeof body).toBe("object");
        expect(body).toHaveProperty("user");
        const { user } = body;
        expect(user).toHaveProperty("username", "mallionaire");
        expect(user).toHaveProperty("name", "haz");
        expect(user).toHaveProperty("avatar_url", expect.any(String));
      });
  });
  //
  it("404: should respond with 404 if username does not exist", () => {
    return request(app)
      .get("/api/users/nayem")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("user does not exist");
      });
  });
});
//
describe("PATCH /api/comments/:comment_id", () => {
  it("200: should accept object with inc_votes and update with new vote in comment", () => {
    const comment_id = 1;
    const newVote = {
      inc_votes: 1,
    };
    return request(app)
      .patch(`/api/comments/${comment_id}`)
      .send(newVote)
      .expect(200)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toHaveProperty("comment_id", comment_id);
        expect(comment).toHaveProperty("body", "I loved this game too!");
        expect(comment).toHaveProperty("votes", 17);
        expect(comment).toHaveProperty("author", "bainesface");
        expect(comment).toHaveProperty("review_id", 2);
        expect(comment).toHaveProperty("created_at", expect.any(String));
      });
  });
  //
  it("400: should respond with 400 bad request if comment id is not a number", () => {
    const comment_id = "banana";
    const newVote = {
      inc_votes: 1,
    };
    return request(app)
      .patch(`/api/comments/${comment_id}`)
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  //
  it("400: should respond with 400 if newVote has not got right keys", () => {
    const comment_id = 1;
    const newVote = {
      wrongKey: 1,
    };
    return request(app)
      .patch(`/api/comments/${comment_id}`)
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("missing or wrong request keys");
      });
  });
  //
  it("400: should respond with 400 bad request if newVote has not got right key value type", () => {
    const comment_id = 1;
    const newVote = {
      inc_votes: "banana",
    };
    return request(app)
      .patch(`/api/reviews/${comment_id}`)
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  //
  it("404: should respond with 404 not existent comment_id", () => {
    const comment_id = 100;
    const newVote = {
      inc_votes: 1,
    };
    return request(app)
      .patch(`/api/comments/${comment_id}`)
      .send(newVote)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("comment not existent");
      });
  });
});
//
describe("POST /api/reviews", () => {
  it("201: should accept object and respond with posted review ", () => {
    const newReview = {
      owner: "mallionaire",
      title: "New Review Title",
      review_body: "Very Fun game!",
      designer: "Nayem",
      category: "euro game",
      review_img_url: "myOwnUrl",
    };
    return request(app)
      .post(`/api/reviews`)
      .send(newReview)
      .expect(201)
      .then(({ body }) => {
        const { review } = body;
        expect(review).toHaveProperty("review_id", 14);
        expect(review).toHaveProperty("owner", "mallionaire");
        expect(review).toHaveProperty("title", "New Review Title");
        expect(review).toHaveProperty("review_body", "Very Fun game!");
        expect(review).toHaveProperty("designer", "Nayem");
        expect(review).toHaveProperty("category", "euro game");
        expect(review).toHaveProperty("review_img_url", "myOwnUrl");
        expect(review).toHaveProperty("votes", 0);
        expect(review).toHaveProperty("created_at", expect.any(String));
        expect(review).toHaveProperty("comment_count", expect.any(String));
      });
  });
  //
  it("201: should ignore additional keys", () => {
    const newReview = {
      owner: "mallionaire",
      title: "New Review Title",
      review_body: "Very Fun game!",
      designer: "Nayem",
      category: "euro game",
      review_img_url: "myOwnUrl",
      additionalKey: "ignore", // <------
    };
    return request(app)
      .post(`/api/reviews`)
      .send(newReview)
      .expect(201)
      .then(({ body }) => {
        const { review } = body;
        expect(review).toHaveProperty("review_id", 14);
        expect(review).toHaveProperty("owner", "mallionaire");
        expect(review).toHaveProperty("title", "New Review Title");
        expect(review).toHaveProperty("review_body", "Very Fun game!");
        expect(review).toHaveProperty("designer", "Nayem");
        expect(review).toHaveProperty("category", "euro game");
        expect(review).toHaveProperty("review_img_url", "myOwnUrl");
        expect(review).toHaveProperty("votes", 0);
        expect(review).toHaveProperty("created_at", expect.any(String));
        expect(review).toHaveProperty("comment_count", expect.any(String));
      });
  });
  //
  it("201: should provide default url if not provided", () => {
    const newReview = {
      owner: "mallionaire",
      title: "New Review Title",
      review_body: "Very Fun game!",
      designer: "Nayem",
      category: "euro game",
      // review_img_url: "myOwnUrl", <----- missing
    };
    return request(app)
      .post(`/api/reviews`)
      .send(newReview)
      .expect(201)
      .then(({ body }) => {
        const { review } = body;
        expect(review).toHaveProperty("review_id", 14);
        expect(review).toHaveProperty("owner", "mallionaire");
        expect(review).toHaveProperty("title", "New Review Title");
        expect(review).toHaveProperty("review_body", "Very Fun game!");
        expect(review).toHaveProperty("designer", "Nayem");
        expect(review).toHaveProperty("category", "euro game");
        expect(review).toHaveProperty("review_img_url", expect.any(String)); // <----- not "myOwnUrl"
        expect(review).toHaveProperty("votes", 0);
        expect(review).toHaveProperty("created_at", expect.any(String));
        expect(review).toHaveProperty("comment_count", expect.any(String));
      });
  });
  //
  it("400: should respond with 400 if new review has got missing body key", () => {
    const newReview = {
      owner: "mallionaire",
      title: "New Review Title",
      // missing relevant keys
    };
    return request(app)
      .post(`/api/reviews`)
      .send(newReview)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("missing or wrong request keys");
      });
  });
  //
  it("404: should respond with 404 not found if user does not exist", () => {
    const newReview = {
      owner: "Wrong User", // <----- use does not exist
      title: "New Review Title",
      review_body: "Very Fun game!",
      designer: "Nayem",
      category: "euro game",
      review_img_url: "myOwnUrl",
    };
    return request(app)
      .post(`/api/reviews`)
      .send(newReview)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("not found");
      });
  });
});
//
describe("GET /api/reviews (pagination)", () => {
  it("200: Should have a default limit of 10 results with a total_count key of all reviews", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body }) => {
        expect(typeof body).toBe("object");
        expect(body).toHaveProperty("reviews");
        expect(body).toHaveProperty("total_count");
        const { reviews } = body;
        const { total_count } = body;
        expect(body.reviews).toBeInstanceOf(Array);
        expect(reviews.length).toBe(10);
        expect(total_count).toBe(13);
      });
  });
  //
  it("200: should accept a query limit and return the correct number of reviews defaulting to first page", () => {
    return request(app)
      .get("/api/reviews?limit=5")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        const { total_count } = body;
        expect(reviews.length).toBe(5);
        expect(total_count).toBe(13);
      });
  });
  //
  it("200: should return an empty array when page is too high", () => {
    return request(app)
      .get("/api/reviews?p=5")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        const { total_count } = body;
        expect(reviews.length).toBe(0);
        expect(total_count).toBe(13);
      });
  });
  //
  it("400: should respond with 400 when passed a limit or p that is not a number", () => {
    return request(app)
      .get("/api/reviews?limit=banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid query");
      });
  });
});
//
describe("GET /api/reviews/:review_id/comments (pagination)", () => {
  it("200: Should have a default limit of 10 results", () => {
    return request(app)
      .get("/api/reviews/3/comments")
      .expect(200)
      .then(({ body }) => {
        expect(typeof body).toBe("object");
        expect(body).toHaveProperty("comments");
        const { comments } = body;
        expect(body.comments).toBeInstanceOf(Array);
        // expect(comments.length).toBe(10); <----- this passed, but we dont have more then 10 comments in test data
      });
  });
  //
  it("200: should accept a query limit and return the correct number of reviews defaulting to first page", () => {
    return request(app)
      .get("/api/reviews/3/comments?limit=3")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments.length).toBe(3);
      });
  });
  //
  it("200: should return an empty array when page is too high", () => {
    return request(app)
      .get("/api/reviews/3/comments?p=5")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments.length).toBe(0);
      });
  });
  //
  it("400: should respond with 400 when passed a limit or p that is not a number", () => {
    return request(app)
      .get("/api/reviews/3/comments?limit=banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid query");
      });
  });
});
//
describe("POST /api/categories", () => {
  it("201: should take a request body with slug & description key(other keys ignored) & return the new category", () => {
    const newCategory = {
      slug: "newCategory",
      description: "awesome description",
    };
    return request(app)
      .post("/api/categories")
      .send(newCategory)
      .expect(201)
      .then(({ body }) => {
        const { category } = body;
        expect(category).toHaveProperty("slug", "newCategory");
        expect(category).toHaveProperty("description", "awesome description");
      });
  });
  //
  it("201: should return the new category if no description is provided", () => {
    const newCategory = {
      slug: "newCategory",
      // description: "awesome description", <----- description not provided
    };
    return request(app)
      .post("/api/categories")
      .send(newCategory)
      .expect(201)
      .then(({ body }) => {
        const { category } = body;
        expect(category).toHaveProperty("slug", "newCategory");
        expect(category).toHaveProperty("description", null);
      });
  });
  //
  it("400: should respond with 400 if category slug already exist", () => {
    const newCategory = {
      slug: "euro game", // <----- already exist
      description: "awesome description",
    };
    return request(app)
      .post("/api/categories")
      .send(newCategory)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("slug already exists");
      });
  });
  //
  it("400: should respond with 400 if category slug is missing", () => {
    const newCategory = {
      // slug: "euro game", <----- missing
      description: "awesome description",
    };
    return request(app)
      .post("/api/categories")
      .send(newCategory)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("missing or wrong request keys");
      });
  });
});
//
describe("DELETE /api/reviews/:review_id", () => {
  it("204: should respond with 204 and delete the review", () => {
    return request(app).delete("/api/reviews/1").expect(204);
  });
  //
  it("400: should respond with 400 if review id is not a number", () => {
    return request(app)
      .delete("/api/reviews/banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  //
  it("404: should respond with 404 if review id does not exist", () => {
    return request(app)
      .delete("/api/reviews/500")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("review does not exist");
      });
  });
});
