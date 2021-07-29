// @ts-nocheck

import getApp from '../server/index.js';
import { generateEntitis, insertEntitis } from './helpers/index.js';

const data = generateEntitis();

const mapping = [['user', 'users'], ['status', 'statuses'], ['label', 'labels'], ['task', 'tasks']];

describe('test entitis pages', () => {
  let app;
  let knex;
  let models;
  let cookie;

  let entitis;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();

    entitis = await insertEntitis(models, data);

    const { email, password } = data.user;

    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: { email, password },
      },
    });

    const [sessionCookie] = responseSignIn.cookies;
    const { name, value } = sessionCookie;
    cookie = { [name]: value };
  });

  test.each(mapping)('index page name %s route %s', async (_, route) => {
    const response = await app.inject({
      method: 'GET',
      url: `/${route}`,
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  test.each(mapping)('create new page name %s route %s', async (_, route) => {
    const response = await app.inject({
      method: 'GET',
      url: `/${route}/new`,
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  test.each(mapping)('edit page name %s route %s', async (name, route) => {
    const { id } = entitis[name];

    const response = await app.inject({
      method: 'GET',
      url: `/${route}/${id}/edit`,
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
