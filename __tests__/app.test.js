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
                    test('status 404: responds with error when passed valud id type that is not present', () => {
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
                        test('status 404: responds with error if correct id but no comments exist', () => {
                            return request(app)
                            .get('/api/reviews/12/comments')
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
    })
})