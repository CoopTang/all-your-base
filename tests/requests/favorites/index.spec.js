var shell = require('shelljs');
var request = require("supertest");
var app = require('../../../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../../../knexfile')[environment];
const database = require('knex')(configuration);


describe('Test the favorites path', () => {
  beforeEach(async () => {
    await database.raw('truncate table users cascade');

    let userData = {
      apiKey: 'asdf'
    };
    await database('users').insert(userData, 'id');

    let user = await database('users').select().first()
    let favoriteParams = {
      user_id: user.id,
      location: 'Denver, CO',
      lat: 38.7773,
      lng: -90.4836,
    }
    await database('favorites').insert(favoriteParams, 'id');
  });

  afterEach(() => {
    database.raw('truncate table users cascade');
  });

  describe('test favorites index', () => {
    it('happy path', async () => {
      let favorites = await database('favorites').select()
      const res = await request(app)
        .get("/api/v1/favorites")
        .send({
          api_key: 'asdf'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toHaveProperty('location');
      expect(res.body[0].current_weather).toHaveProperty('summary')
      expect(res.body[0].current_weather).toHaveProperty('icon')
      expect(res.body[0].current_weather).toHaveProperty('precipIntensity')
      expect(res.body[0].current_weather).toHaveProperty('precipProbability')
      expect(res.body[0].current_weather).toHaveProperty('temperature')
      expect(res.body[0].current_weather).toHaveProperty('humidity')
      expect(res.body[0].current_weather).toHaveProperty('pressure')
      expect(res.body[0].current_weather).toHaveProperty('windSpeed')
      expect(res.body[0].current_weather).toHaveProperty('windGust')
      expect(res.body[0].current_weather).toHaveProperty('windBearing')
      expect(res.body[0].current_weather).toHaveProperty('cloudCover')
      expect(res.body[0].current_weather).toHaveProperty('visibility')
    });
    
    it('sad path', async () => {
      const res = await request(app)
        .get("/api/v1/favorites")
        .send({
          api_key: 'fff'
        });

      expect(res.statusCode).toBe(401);
    });
  });
});
