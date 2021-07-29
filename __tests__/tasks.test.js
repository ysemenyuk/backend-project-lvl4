// @ts-nocheck

import getApp from '../server/index.js';
import { generateEntity, insertEntity } from './helpers/index.js';

const userData1 = generateEntity('user');
const userData2 = generateEntity('user');
const statusData1 = generateEntity('status');
const statusData2 = generateEntity('status');
const labelData1 = generateEntity('label');
const labelData2 = generateEntity('label');
const taskData1 = generateEntity('task');
const taskData2 = generateEntity('task');

describe('test tasks CRUD', () => {
  let app;
  let knex;
  let models;

  const entitis = {};

  let cookie;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();

    entitis.user1 = await insertEntity('user', models.user, userData1);
    entitis.user2 = await insertEntity('user', models.user, userData2);

    entitis.status1 = await insertEntity('status', models.status, statusData1);
    entitis.status2 = await insertEntity('status', models.status, statusData2);

    entitis.label1 = await insertEntity('label', models.label, labelData1);
    entitis.label2 = await insertEntity('label', models.label, labelData2);

    taskData1.creatorId = entitis.user1.id;
    taskData1.statusId = entitis.status1.id;
    taskData1.labels = [{ id: entitis.label1.id }];

    entitis.task1 = await insertEntity('task', models.task, taskData1);

    taskData2.creatorId = entitis.user2.id;
    taskData2.statusId = entitis.status1.id;
    taskData2.labels = [{ id: entitis.label1.id }];

    entitis.task2 = await insertEntity('task', models.task, taskData2);

    const { email, password } = userData1;

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
    form.statusId = entitis.status1.id;
    form.labels = [entitis.label1.id];

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
      statusId: entitis.status2.id,
      labels: [entitis.label1.id, entitis.label2.id],
    };

    const response = await app.inject({
      method: 'PATCH',
      url: `/tasks/${entitis.task1.id}`,
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
      url: `/tasks/${entitis.task1.id}`,
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
      url: `/tasks/${entitis.task1.id}`,
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const deletedTask = await models.task.query().findById(entitis.task1.id);

    expect(deletedTask).toBeUndefined();
  });

  test('delete error', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/tasks/${entitis.task2.id}`,
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const task = await models.task.query().findById(entitis.task2.id).withGraphFetched('labels');
    console.log(1111, task);
    // task.labels = task.labels.map((i) => i.id);

    expect(task).toMatchObject(entitis.task2);
  });
});
