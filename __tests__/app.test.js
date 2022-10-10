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
                            expect(body.review).toEqual({
                                review_id: 12,
                                title: `Scythe; you're gonna need a bigger table!`,
                                review_body: 'Spend 30 minutes just setting up all of the boards (!) meeple and decks, just to forget how to play. Scythe can be a lengthy game but really packs a punch if you put the time in. With beautiful artwork, countless scenarios and clever game mechanics, this board game is a must for any board game fanatic; just make sure you explain ALL the rules before you start playing with first timers or you may find they bring it up again and again.',
                                designer: 'Jamey Stegmaier',
                                review_img_url: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
                                votes: 100,
                                category: 'social deduction',
                                owner: 'mallionaire',
                                created_at: "2021-01-22T10:37:04.839Z"
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
                })
            })
        })
    })
})