// @ts-nocheck

import getApp from '../server/index.js';
import testData from './helpers/index.js';

describe('test labels CRUD', () => {
  let app;
  let knex;
  let models;

  let creator;
  let executor;
  // let label;
  let status;
  let task;

  let cookie;

  const userData = testData.getUser();
  const userExecutorData = testData.getUser();
  const statusData = testData.getStatus();
  const labelData = testData.getLabel();
  const taskData = testData.getTask();

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    creator = await models.user.query().insert(userData);
    executor = await models.user.query().insert(userExecutorData);
    status = await models.status.query().insert(statusData);
    await models.label.query().insert(labelData);
    task = await models.task.query().insert({
      ...taskData,
      statusId: status.id,
      creatorId: creator.id,
      executorId: executor.id,
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

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks'),
      cookies: cookie,
    });

    const tasks = await models.task.query();

    console.log(123, task);
    console.log(456, tasks);

    expect(response.statusCode).toBe(200);
  });
});
