// @ts-nocheck

import getApp from '../server/index.js';
import { generateEntity, insertEntity } from './helpers/index.js';

const userData = generateEntity('user');
const statusData1 = generateEntity('status');
const statusData2 = generateEntity('status');
const taskData = generateEntity('task');

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;

  let status1;
  let status2;

  let cookie;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();

    const user = await insertEntity('user', models.user, userData);
    status1 = await insertEntity('status', models.status, statusData1);
    status2 = await insertEntity('status', models.status, statusData2);

    taskData.creatorId = user.id;
    taskData.statusId = status1.id;

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

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newStatus'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const newStatus = generateEntity('status');

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('statuses'),
      cookies: cookie,
      payload: {
        data: newStatus,
      },
    });

    expect(response.statusCode).toBe(302);

    const createdStatus = await models.status.query().findOne({ name: newStatus.name });

    expect(createdStatus).toMatchObject(newStatus);
  });

  it('create error', async () => {
    const newStatus = { name: '' };

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('statuses'),
      cookies: cookie,
      payload: {
        data: newStatus,
      },
    });

    expect(response.statusCode).toBe(200);

    const createdStatus = await models.status.query().findOne({ name: newStatus.name });

    expect(createdStatus).toBeUndefined();
  });

  it('update', async () => {
    const { id } = status1;
    const updateForm = { name: 'newStatusName' };

    const response = await app.inject({
      method: 'PATCH',
      url: `/statuses/${id}`,
      cookies: cookie,
      payload: {
        data: updateForm,
      },
    });

    expect(response.statusCode).toBe(302);

    const updatedStatus = await models.status.query().findOne({ name: updateForm.name });
    expect(updatedStatus).toMatchObject(updateForm);
  });

  it('update error', async () => {
    const { id } = status1;
    const updateForm = { name: '' };

    const response = await app.inject({
      method: 'PATCH',
      url: `/statuses/${id}`,
      cookies: cookie,
      payload: {
        data: updateForm,
      },
    });

    expect(response.statusCode).toBe(200);

    const updatedStatus = await models.status.query().findOne({ name: updateForm.name });
    expect(updatedStatus).toBeUndefined();
  });

  it('delete', async () => {
    const { id } = status2;

    const response = await app.inject({
      method: 'DELETE',
      url: `/statuses/${id}`,
    });

    expect(response.statusCode).toBe(302);

    const deletedStatus = await models.status.query().findById(id);
    expect(deletedStatus).toBeUndefined();
  });

  it('delete error', async () => {
    const { id } = status1;

    const response = await app.inject({
      method: 'DELETE',
      url: `/statuses/${id}`,
    });

    expect(response.statusCode).toBe(302);

    const deletedStatus = await models.status.query().findById(id);
    expect(deletedStatus).toMatchObject(status1);
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
