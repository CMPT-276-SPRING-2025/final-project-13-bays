const request = require('supertest');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello from the Express backend!');
});

describe('GET /', () => {
  it('should return Hello from the Express backend!', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Hello from the Express backend!');
  });
});