// @ts-nocheck

import getApp from '../server/index.js';
import { generateEntity, generateEntitis, insertEntitis } from './helpers/index.js';

const data1 = generateEntitis();
const data2 = generateEntitis();

describe('test tasks CRUD', () => {
  let app;
  let knex;
  let models;

  let entitis1;
  let entitis2;

  let cookie;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();

    entitis1 = await insertEntitis(models, data1);
    entitis2 = await insertEntitis(models, data2);

    const { email, password } = data1.user;

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

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });

  it('create', async () => {
    const form = generateEntity('task');
    form.statusId = entitis1.status.id;
    form.labels = [entitis1.label.id];

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('tasks'),
      cookies: cookie,
      payload: {
        data: form,
      },
    });

    expect(response.statusCode).toBe(302);

    const createdTask = await models.task
      .query()
      .findOne({ name: form.name })
      .withGraphFetched('labels');

    createdTask.labels = createdTask.labels.map((i) => i.id);

    expect(createdTask).toMatchObject(form);
  });

  it('create error', async () => {
    const form = { name: '' };

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('tasks'),
      cookies: cookie,
      payload: {
        data: form,
      },
    });

    expect(response.statusCode).toBe(200);

    const createdTask = await models.task.query().findOne({ name: form.name });

    expect(createdTask).toBeUndefined();
  });

  test('update', async () => {
    const form = {
      name: 'newTaskName',
      statusId: entitis1.status.id,
      labels: [entitis1.label.id, entitis2.label.id],
    };

    const response = await app.inject({
      method: 'PATCH',
      url: `/tasks/${entitis1.task.id}`,
      cookies: cookie,
      payload: {
        data: form,
      },
    });

    expect(response.statusCode).toBe(302);

    const updatedTask = await models.task
      .query()
      .findOne({ name: form.name })
      .withGraphFetched('labels');

    updatedTask.labels = updatedTask.labels.map((i) => i.id);

    expect(updatedTask).toMatchObject(form);
  });

  test('update error', async () => {
    const form = {
      name: 'newTaskName',
    };

    const response = await app.inject({
      method: 'PATCH',
      url: `/tasks/${entitis1.task.id}`,
      cookies: cookie,
      payload: {
        data: form,
      },
    });

    expect(response.statusCode).toBe(200);

    const updatedTask = await models.task.query().findOne({ name: form.name });

    expect(updatedTask).toBeUndefined();
  });

  test('delete', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/tasks/${entitis1.task.id}`,
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const deletedTask = await models.task.query().findById(entitis1.task.id);

    expect(deletedTask).toBeUndefined();
  });

  test('delete error', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/tasks/${entitis2.task.id}`,
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const task = await models.task.query().findById(entitis2.task.id).withGraphFetched('labels');

    expect(task).toMatchObject(entitis2.task);
  });
});
