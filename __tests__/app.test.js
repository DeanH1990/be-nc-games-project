const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data');
const db = require('../db/connection');
const app = require('../app.js');
const request = require('supertest');

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('app', () => {
    describe('/not-a-route', () => {
        test('status 404: route not found', () => {
            return request(app)
            .get('/api/anything')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('Route not found')
            })
        })
    })
    describe('/api', () => {
        describe('GET: /api', () => {
            test('200: responds with an object containing all endpoints', () => {
                const endpoints = {
                    "GET /api": expect.any(Object),
                    "GET /api/categories": expect.any(Object),
                    "GET /api/reviews": expect.any(Object),
                    "GET /api/reviews/:review_id": expect.any(Object),
                    "PATCH /api/reviews/:review_id": expect.any(Object),
                    "GET /api/reviews/:review_id/comments": expect.any(Object),
                    "POST /api/reviews/:review_id/comments": expect.any(Object),
                    "GET /api/users": expect.any(Object),
                    "DELETE /api/comments/:comment_id": expect.any(Object)
                }
                return request(app)
                .get('/api')
                .expect(200)
                .then(({ body }) => {
                    expect(body).toMatchObject(endpoints)
                })
            })
        })
        describe('/categories', () => {
            describe('GET: /api/categories', () => {
                test('status 200: responds with an array of categories', () => {
                    return request(app)
                    .get('/api/categories')
                    .expect(200)
                    .then(({ body }) => {
                        const { categories } = body;
                        expect(categories).toBeInstanceOf(Array);
                        expect(categories).toHaveLength(4)
                        categories.forEach(category => {
                            expect(category).toEqual(
                                expect.objectContaining({
                                    slug: expect.any(String),
                                    description: expect.any(String)
                                })
                            )
                        })
                    })
                })
            })
        })
        describe('/reviews', () => {
            describe('GET: /api/reviews', () => {
                test('status 200: responds with array of reviews that have comment_count key', () => {
                    return request(app)
                    .get('/api/reviews')
                    .expect(200)
                    .then(({ body }) => {
                        const { reviews } = body;
                        expect(reviews).toBeInstanceOf(Array);
                        expect(reviews).toHaveLength(13);
                        reviews.forEach(review => {
                            expect(review).toEqual(
                                expect.objectContaining({
                                    owner: expect.any(String),
                                    title: expect.any(String),
                                    review_id: expect.any(Number),
                                    category: expect.any(String),
                                    review_img_url: expect.any(String),
                                    created_at: expect.any(String),
                                    votes: expect.any(Number),
                                    designer: expect.any(String),
                                    comment_count: expect.any(Number)
                                })
                            )
                        })
                    })
                })
                test('status 200: reviews are sorted by date in descending order by default', () => {
                    return request(app)
                    .get('/api/reviews')
                    .expect(200)
                    .then(({ body }) => {
                        const { reviews } = body;
                        expect(reviews).toBeSortedBy('created_at', { descending: true })
                    })
                })
                test('status 200: allows reviews to be viewed by selected category', () => {
                    return request(app)
                    .get("/api/reviews?category=dexterity")
                    .expect(200)
                    .then(({ body }) => {
                        const { reviews } = body;
                        expect(reviews).toHaveLength(1);
                        reviews.forEach(review => {
                            expect(review.category).toBe('dexterity')
                        })
                    })
                })
                test('status 200: responds with empty array if valid category but no results', () => {
                    return request(app)
                    .get("/api/reviews?category=children's games")
                    .expect(200)
                    .then(({ body }) => {
                        const { reviews } = body;
                        expect(reviews).toHaveLength(0)
                        expect(reviews).toEqual([])
                    })
                })
                test('status 200: responds with reviews sorted by given column', () => {
                    return request(app)
                    .get('/api/reviews?sort_by=votes')
                    .expect(200)
                    .then(({ body }) => {
                        const { reviews } = body;
                        expect(reviews).toHaveLength(13);
                        expect(reviews).toBeSortedBy('votes', { descending: true })
                    })
                })
                test('status 200: responds with reviews ordered in ascending order when specified', () => {
                    return request(app)
                    .get('/api/reviews?order=asc')
                    .expect(200)
                    .then(({ body }) => {
                        const { reviews } = body;
                        expect(reviews).toHaveLength(13);
                        expect(reviews).toBeSortedBy('created_at', { ascending: true })
                    })
                })
                test('status 400: responds with error if passed invalid order query', () => {
                    return request(app)
                    .get('/api/reviews?order=upwards')
                    .expect(400)
                    .then(({ body }) => {
                        expect(body.msg).toBe('Invalid query')
                    })
                })
                test('status 200: responds with selected reviews when given all 3 search order queries', () => {
                    return request(app)
                    .get('/api/reviews?order=asc&category=dexterity&sort_by=review_id')
                    .expect(200)
                    .then(({ body }) => {
                        const { reviews } = body;
                        expect(reviews).toHaveLength(1);
                        expect(reviews).toBeSortedBy('review_id');
                        reviews.forEach(review => {
                            expect(review.category).toBe('dexterity')
                        })
                    })
                })
                test('status 400: responds with error if given invalid sort_by query', () => {
                    return request(app)
                    .get('/api/reviews?sort_by=carrots')
                    .expect(400)
                    .then(({ body }) => {
                        expect(body.msg).toBe('Invalid query')
                    })
                })
                test('status 404: responds with error if passed an invalid category query', () => {
                    return request(app)
                    .get('/api/reviews?category=bananas')
                    .expect(404)
                    .then(({ body }) => {
                        expect(body.msg).toBe('Not found')
                    })
                })
                
            })
            describe('/:review_id', () => {
                describe('GET: /api/reviews/:review_id', () => {
                    test('status 200: responds with correct review from review id', () => {
                        return request(app)
                        .get('/api/reviews/12')
                        .expect(200)
                        .then(({ body }) => {
                            const { review } = body;
                            expect(review).toMatchObject({
                                review_id: 12,
                                title: `Scythe; you're gonna need a bigger table!`,
                                review_body: 'Spend 30 minutes just setting up all of the boards (!) meeple and decks, just to forget how to play. Scythe can be a lengthy game but really packs a punch if you put the time in. With beautiful artwork, countless scenarios and clever game mechanics, this board game is a must for any board game fanatic; just make sure you explain ALL the rules before you start playing with first timers or you may find they bring it up again and again.',
                                designer: 'Jamey Stegmaier',
                                review_img_url: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
                                votes: 100,
                                category: 'social deduction',
                                owner: 'mallionaire',
                                created_at: "2021-01-22T10:37:04.839Z",
                            })
                        })
                    })
                    test('status 200: responds with correct review with comment_count on returned object', () => {
                        return request(app)
                        .get('/api/reviews/3')
                        .expect(200)
                        .then(({ body }) => {
                            const { review } = body;
                            expect(review).toMatchObject({
                                review_id: 3,
                                title: 'Ultimate Werewolf',
                                designer: 'Akihisa Okui',
                                owner: 'bainesface',
                                review_img_url:
                                'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                                review_body: "We couldn't find the werewolf!",
                                category: 'social deduction',
                                created_at: '2021-01-18T10:01:41.251Z',
                                votes: 5,
                                comment_count: 3
                            })
                        })
                    })
                    test('status 400: responds with error passed an id of an incorrect type', () => {
                        return request(app)
                        .get('/api/reviews/not-a-number')
                        .expect(400)
                        .then(({ body }) => {
                            expect(body.msg).toBe('Invalid ID type')
                        })
                    })
                    test('status 404: responds with error when passed valid id type that is not present', () => {
                        return request(app)
                        .get('/api/reviews/50000')
                        .expect(404)
                        .then(({ body }) => {
                            expect(body.msg).toBe('Review ID not found')
                        })
                    })
                })
                describe('PATCH: /api/reviews/:review_id', () => {
                    test('status 200: responds with the correctly updated review', () => {
                        const updateVotes = { inc_votes: 1};
                        return request(app)
                        .patch('/api/reviews/2')
                        .send(updateVotes)
                        .expect(200)
                        .then(({ body }) => {
                            const { review } = body;
                            expect(review).toEqual({
                                review_id: 2,
                                title: 'Jenga',
                                designer: 'Leslie Scott',
                                owner: 'philippaclaire9',
                                review_img_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                                review_body: 'Fiddly fun for all the family',
                                category: 'dexterity',
                                created_at: '2021-01-18T10:01:41.251Z',
                                votes: 6
                            })
                        })
                    })
                    test('status 400: responds with error if inc_votes is not a number', () => {
                        const updateVotes = { inc_votes: 'amazing' };
                        return request(app)
                        .patch('/api/reviews/2')
                        .send(updateVotes)
                        .expect(400)
                        .then(({ body }) => {
                            expect(body.msg).toBe('Wrong input')
                        })
                    })
                    test('status 400: responds with error if incorrect key', () => {
                        const updateVotes = { inc_vote: 5 };
                        return request(app)
                        .patch('/api/reviews/2')
                        .send(updateVotes)
                        .expect(400)
                        .then(({ body }) => {
                            expect(body.msg).toBe('Wrong input')
                        })
                    })
                    test('status 400: responds with error if request body is empty', () => {
                        const updateVotes = { };
                        return request(app)
                        .patch('/api/reviews/2')
                        .send(updateVotes)
                        .expect(400)
                        .then(({ body }) => {
                            expect(body.msg).toBe('Wrong input')
                        })
                    })
                    test('status 404: responds with error if passed valid review id that is not present', () => {
                        const updateVotes = { inc_votes: 5 };
                        return request(app)
                        .patch('/api/reviews/50')
                        .send(updateVotes)
                        .expect(404)
                        .then(({ body }) => {
                            expect(body.msg).toBe('Review ID not found')
                        })
                    })
                })
                describe('/comments', () => {
                    describe('GET: /api/reviews/:review_id/comments', () => {
                        test('status 200: responds with array of comments for given review_id', () => {
                            return request(app)
                            .get('/api/reviews/2/comments')
                            .expect(200)
                            .then(({ body }) => {
                                const { comments } = body;
                                expect(comments).toBeInstanceOf(Array);
                                expect(comments).toHaveLength(3)
                                comments.forEach(comment => {
                                    expect(comment).toEqual(
                                        expect.objectContaining({
                                            comment_id: expect.any(Number),
                                            votes: expect.any(Number),
                                            created_at: expect.any(String),
                                            author: expect.any(String),
                                            body: expect.any(String),
                                            review_id: expect.any(Number)
                                        })
                                    )
                                })
                            })
                        })
                        test('status 200: responds with newest comments first', () => {
                            return request(app)
                            .get('/api/reviews/2/comments')
                            .expect(200)
                            .then(({ body }) => {
                                const { comments } = body;
                                expect(comments).toBeSortedBy('created_at', { descending: true });
                            })
                        })
                        test('status 200: responds with error if correct id but no comments exist', () => {
                            return request(app)
                            .get('/api/reviews/12/comments')
                            .expect(200)
                            .then(({ body }) => {
                                const { comments } = body;
                                expect(comments).toHaveLength(0);
                                expect(comments).toEqual([])
                            })
                        })
                        test('status 400: responds with error if invalid review id type', () => {
                            return request(app)
                            .get('/api/reviews/gimme/comments')
                            .expect(400)
                            .then(({ body }) => {
                                expect(body.msg).toBe('Invalid ID type')
                            })
                        })
                        test('status 404: responds with error if valid id type but review does not exist', () => {
                            return request(app)
                            .get('/api/reviews/15/comments')
                            .expect(404)
                            .then(({ body }) => {
                                expect(body.msg).toBe('Not found')
                            })
                        })
                    })
                    describe('POST: /api/reviews/:review_id/comments', () => {
                        test('status 201: responds with a new comment when posted from a username with a body', () => {
                            const newComment = {
                                username: 'bainesface',
                                body: 'Ah MAZING!'
                            };
                            return request(app)
                            .post('/api/reviews/2/comments')
                            .send(newComment)
                            .expect(201)
                            .then(({ body }) => {
                                const { comment } = body;
                                expect(comment).toMatchObject({
                                    comment_id: 7,
                                    review_id: 2,
                                    author: 'bainesface',
                                    body: 'Ah MAZING!',
                                    votes: 0,
                                    created_at: expect.any(String)
                                })
                            })
                        })
                        test('status 400: responds with error if invalid review id type', () => {
                            return request(app)
                            .post('/api/reviews/scythe/comments')
                            .send({ username: 'bainesface', body: 'A must play!' })
                            .expect(400)
                            .then(({ body }) => {
                                expect(body.msg).toBe('Invalid ID type')
                            })
                        })
                        test('status 400: responds with error if request body missing username', () => {
                            return request(app)
                            .post('/api/reviews/2/comments')
                            .send({ username: '', body: 'A must play!' })
                            .expect(400)
                            .then(({ body }) => {
                                expect(body.msg).toBe('Invalid input')
                            })
                        })
                        test('status 400: responds with error if request body missing body', () => {
                            return request(app)
                            .post('/api/reviews/2/comments')
                            .send({ username: 'bainesface', body: '' })
                            .expect(400)
                            .then(({ body }) => {
                                expect(body.msg).toBe('Invalid input')
                            })
                        })
                        test('status 404: responds with error if valid id type but review does not exist', () => {
                            return request(app)
                            .post('/api/reviews/15/comments')
                            .send({ username: 'bainesface', body: 'A must play!' })
                            .expect(404)
                            .then(({ body }) => {
                                expect(body.msg).toBe('Not found')
                            })
                        })
                        test('status 404: responds with error if user does not exist', () => {
                            return request(app)
                            .post('/api/reviews/15/comments')
                            .send({ username: 'greeGiant', body: 'A must play!' })
                            .expect(404)
                            .then(({ body }) => {
                                expect(body.msg).toBe('Not found')
                            })
                        })
                    })
                })
            })
        })
        describe('/users', () => {
            describe('GET: /api/users', () => {
                test('status 200: responds with an array of users', () => {
                    return request(app)
                    .get('/api/users')
                    .expect(200)
                    .then(({ body }) => {
                        const { users } = body;
                        expect(users).toBeInstanceOf(Array);
                        expect(users).toHaveLength(4);
                        users.forEach(user => {
                            expect(user).toEqual(
                                expect.objectContaining({
                                    username: expect.any(String),
                                    name: expect.any(String),
                                    avatar_url: expect.any(String)
                                })
                            )
                        })
                    })
                })
            })
        })
        describe('/comments', () => {
            describe('/:comment_id', () => {
                describe('DELETE: /api/comments/:comment_id', () => {
                    test('status 204: responds with 204 no content status', () => {
                        return request(app)
                        .delete('/api/comments/5')
                        .expect(204)
                    })
                    test('status 400: responds with error if passed invalid comment_id', () => {
                        return request(app)
                        .delete('/api/comments/lastComment')
                        .expect(400)
                        .then(({ body }) => {
                            expect(body.msg).toBe('Invalid ID type')
                        })
                    })
                    test('status 404: responds with error if passed valid comment_id but does not exist', () => {
                        return request(app)
                        .delete('/api/comments/10')
                        .expect(404)
                        .then(({ body }) => {
                            
                            expect(body.msg).toBe('Not found')
                        })
                    })
                })
            })
        })
    })
})