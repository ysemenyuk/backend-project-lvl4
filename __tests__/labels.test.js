// @ts-nocheck

import getApp from '../server/index.js';
import { generateEntity, insertEntity } from './helpers/index.js';

const userData = generateEntity('user');
const statusData = generateEntity('status');
const labelData1 = generateEntity('label');
const labelData2 = generateEntity('label');
const taskData = generateEntity('task');

describe('test labels CRUD', () => {
  let app;
  let knex;
  let models;

  let label1;
  let label2;

  let cookie;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();

    const user = await insertEntity('user', models.user, userData);
    const status = await insertEntity('status', models.status, statusData);
    label1 = await insertEntity('label', models.label, labelData1);
    label2 = await insertEntity('label', models.label, labelData2);

    taskData.creatorId = user.id;
    taskData.statusId = status.id;
    taskData.labels = [{ id: label1.id }];

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
      url: app.reverse('labels'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newLabel'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const newLabel = generateEntity('label');

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('labels'),
      cookies: cookie,
      payload: {
        data: newLabel,
      },
    });

    expect(response.statusCode).toBe(302);

    const createdLabel = await models.label.query().findOne({ name: newLabel.name });

    expect(createdLabel).toMatchObject(newLabel);
  });

  it('create error', async () => {
    const newLabel = { name: '' };

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('labels'),
      cookies: cookie,
      payload: {
        data: newLabel,
      },
    });

    expect(response.statusCode).toBe(200);

    const createdLabel = await models.label.query().findOne({ name: newLabel.name });

    expect(createdLabel).toBeUndefined();
  });

  it('update', async () => {
    const { id } = label2;
    const updateForm = { name: 'newname' };

    const response = await app.inject({
      method: 'PATCH',
      url: `/labels/${id}`,
      cookies: cookie,
      payload: {
        data: updateForm,
      },
    });

    expect(response.statusCode).toBe(302);

    const updatedLabel = await models.label.query().findOne({ name: updateForm.name });
    expect(updatedLabel).toMatchObject(updateForm);
  });

  it('update error', async () => {
    const { id } = label2;
    const updateForm = { name: '' };

    const response = await app.inject({
      method: 'PATCH',
      url: `/labels/${id}`,
      cookies: cookie,
      payload: {
        data: updateForm,
      },
    });

    expect(response.statusCode).toBe(200);

    const updatedLabel = await models.label.query().findOne({ name: updateForm.name });
    expect(updatedLabel).toBeUndefined();
  });

  it('delete', async () => {
    const { id } = label2;

    const response = await app.inject({
      method: 'DELETE',
      url: `/labels/${id}`,
    });

    expect(response.statusCode).toBe(302);

    const deletedLabel = await models.label.query().findById(id);
    expect(deletedLabel).toBeUndefined();
  });

  it('delete error', async () => {
    const { id } = label1;

    const response = await app.inject({
      method: 'DELETE',
      url: `/labels/${id}`,
    });

    expect(response.statusCode).toBe(302);

    const deletedLabel = await models.label.query().findById(id);
    expect(deletedLabel).toMatchObject(label1);
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
