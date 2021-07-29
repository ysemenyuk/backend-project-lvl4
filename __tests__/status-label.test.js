// @ts-nocheck

import getApp from '../server/index.js';
import { generateEntity, insertEntity } from './helpers/index.js';

const userData = generateEntity('user');
const statusData = generateEntity('status');
const labelData = generateEntity('label');
const statusData2 = generateEntity('status');
const labelData2 = generateEntity('label');
const taskData = generateEntity('task');

const mapping = [['status', 'statuses'], ['label', 'labels']];

describe('test status/label CRUD', () => {
  let app;
  let knex;
  let models;

  const entitis = {};
  const entitis2 = {};

  let cookie;

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

    entitis2.status = await insertEntity('status', models.status, statusData2);
    entitis2.label = await insertEntity('label', models.label, labelData2);

    taskData.creatorId = entitis.user.id;
    taskData.statusId = entitis2.status.id;
    taskData.labels = [{ id: entitis2.label.id }];

    await insertEntity('task', models.task, taskData);

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

  test.each(mapping)('create name %s route %s', async (name, route) => {
    const newEntity = generateEntity(name);
    const response = await app.inject({
      method: 'POST',
      url: app.reverse(route),
      cookies: cookie,
      payload: {
        data: newEntity,
      },
    });
    expect(response.statusCode).toBe(302);
    const createdEntity = await models[name].query().findOne({ name: newEntity.name });
    expect(createdEntity).toMatchObject(newEntity);
  });

  test.each(mapping)('create error name %s route %s', async (_, route) => {
    const newEntity = { name: '' };
    const response = await app.inject({
      method: 'POST',
      url: app.reverse(route),
      cookies: cookie,
      payload: {
        data: newEntity,
      },
    });

    expect(response.statusCode).toBe(200);

    const createdEntity = await models.status.query().findOne({ name: newEntity.name });

    expect(createdEntity).toBeUndefined();
  });

  test.each(mapping)('update name %s route %s', async (name, route) => {
    const { id } = entitis[name];
    const updateForm = { name: 'newName' };

    const response = await app.inject({
      method: 'PATCH',
      url: `/${route}/${id}`,
      cookies: cookie,
      payload: {
        data: updateForm,
      },
    });

    expect(response.statusCode).toBe(302);

    const updatedEntity = await models[name].query().findOne({ name: updateForm.name });
    expect(updatedEntity).toMatchObject(updateForm);
  });

  test.each(mapping)('update error name %s route %s', async (name, route) => {
    const { id } = entitis[name];
    const updateForm = { name: '' };

    const response = await app.inject({
      method: 'PATCH',
      url: `/${route}/${id}`,
      cookies: cookie,
      payload: {
        data: updateForm,
      },
    });

    expect(response.statusCode).toBe(200);

    const updatedEntity = await models[name].query().findOne({ name: updateForm.name });
    expect(updatedEntity).toBeUndefined();
  });

  test.each(mapping)('delete name %s route %s', async (name, route) => {
    const { id } = entitis[name];

    const response = await app.inject({
      method: 'DELETE',
      url: `/${route}/${id}`,
    });

    expect(response.statusCode).toBe(302);

    const deletedEntity = await models[name].query().findById(id);
    expect(deletedEntity).toBeUndefined();
  });

  test.each(mapping)('delete error name %s route %s', async (name, route) => {
    const { id } = entitis2[name];

    const response = await app.inject({
      method: 'DELETE',
      url: `/${route}/${id}`,
    });

    expect(response.statusCode).toBe(302);

    const deletedEntity = await models[name].query().findById(id);
    expect(deletedEntity).toMatchObject(entitis2[name]);
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
