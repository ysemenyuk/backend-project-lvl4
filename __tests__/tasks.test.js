// @ts-nocheck

import getApp from '../server/index.js';
import testData from './helpers/index.js';

const userData = testData.getUser();
const statusData1 = testData.getStatus();
const statusData2 = testData.getStatus();
const labelData1 = testData.getLabel();
const labelData2 = testData.getLabel();
const taskData = testData.getTask();

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

    user = await models.user.query().insert(userData);
    status1 = await models.status.query().insert(statusData1);
    status2 = await models.status.query().insert(statusData2);
    label1 = await models.label.query().insert(labelData1);
    label2 = await models.label.query().insert(labelData2);

    task = await models.task.query().insert({
      ...taskData,
      creatorId: user.id,
      statusId: status1.id,
    });

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
    const form = testData.getTask();
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
    const form = testData.getTask();

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
