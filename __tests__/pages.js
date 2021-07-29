// @ts-nocheck

import getApp from '../server/index.js';
import { generateEntity, insertEntity } from './helpers/index.js';

const userData = generateEntity('user');
const statusData = generateEntity('status');
const labelData = generateEntity('label');
const taskData = generateEntity('task');

const mapping = [['user', 'users'], ['status', 'statuses'], ['label', 'labels'], ['task', 'tasks']];

describe('test entitis pages', () => {
  let app;
  let knex;
  let models;
  let cookie;

  const entitis = {};

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();

    entitis.user = await insertEntity('user', models.user, userData);
    entitis.status = await insertEntity('status', models.status, statusData);
    entitis.label = await insertEntity('label', models.label, labelData);

    taskData.creatorId = entitis.user.id;
    taskData.statusId = entitis.status.id;
    taskData.labels = [{ id: entitis.label.id }];

    entitis.task = await insertEntity('task', models.task, taskData);

    const { email, password } = userData;

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
