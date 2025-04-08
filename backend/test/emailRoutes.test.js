const request = require('supertest');
const app = require('../server');

describe('Email Routes', () => {
  it('should send daily emails successfully', async () => {
    const res = await request(app).get('/email/daily');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Daily emails sent successfully.');
  });

  it('should handle errors in daily email route', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress error logs
    const res = await request(app).get('/email/daily');
    expect(res.statusCode).toBe(500);
    expect(res.text).toBe('Failed to send daily emails.');
  });
});