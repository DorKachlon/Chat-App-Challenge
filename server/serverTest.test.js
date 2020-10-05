const request = require('supertest');
const app = require('./app');

describe('Server Tests', () => {
  it('should add and get messages to and from messages array', async () => {
    const data = {
      body: 'Hello',
      user: 'Roy'
    };
    const firstRes = await request(app).get('/messages').expect(200);
    await request(app).post('/messages').send(data).expect(200);
    const secondRes = await request(app).get('/messages').expect(200);
    expect(firstRes.body.length).toBe(secondRes.body.length - 1);
    expect(secondRes.body[secondRes.body.length - 1]).toEqual(data);
  });
});