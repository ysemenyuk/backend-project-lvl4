// @ts-nocheck

import getApp from '../server/index.js';
import { generateEntity, insertEntity } from './helpers/index.js';

const userData = generateEntity('user');
const statusData1 = generateEntity('status');
const statusData2 = generateEntity('status');
const labelData1 = generateEntity('label');
const labelData2 = generateEntity('label');
const taskData = generateEntity('task');

describe('test tasks CRUD', () => {
  let app;
  let knex;
  let models;

  let user;
  let status1;
  let status2;
  let label1;
  let label2;
  let task;

  let cookie;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();

    user = await insertEntity('user', models.user, userData);
    status1 = await insertEntity('status', models.status, statusData1);
    status2 = await insertEntity('status', models.status, statusData2);
    label1 = await insertEntity('label', models.label, labelData1);
    label2 = await insertEntity('label', models.label, labelData2);

    taskData.creatorId = user.id;
    taskData.statusId = status1.id;
    taskData.labels = [{ id: label1.id }];

    task = await insertEntity('task', models.task, taskData);

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

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newTask'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const form = generateEntity('task');
    form.statusId = status1.id;
    form.labels = [label1.id];

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
    const form = generateEntity('task');

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
      statusId: status2.id,
      labels: [label1.id, label2.id],
    };

    const response = await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
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
      url: `/tasks/${task.id}`,
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
      url: `/tasks/${task.id}`,
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const deletedTask = await models.task.query().findById(task.id);

    expect(deletedTask).toBeUndefined();
  });
});
