describe('app', () => {
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