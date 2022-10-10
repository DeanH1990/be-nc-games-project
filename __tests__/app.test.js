const seed = require('../db/seeds/seed');
const { categoryData, commentData, reviewData, userData } = require('../db/data/test-data');
const db = require('../db/connection');
const app = require('../app.js');
const request = require('supertest');

beforeEach(() => seed({categoryData, commentData, reviewData, userData}));
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
    })
})