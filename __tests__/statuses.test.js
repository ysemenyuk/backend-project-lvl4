// @ts-nocheck

// import _ from 'lodash';
import getApp from '../server/index.js';
// import encrypt from '../server/lib/secure.js';
import testData from './helpers/index.js';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;
  // let user;
  let status;

  let cookie;

  const userData = testData.getUser();
  const statusData = testData.getStatus();

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await models.user.query().insert(userData);
    status = await models.status.query().insert(statusData);

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
    const newStatus = testData.getStatus();

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

  it('update', async () => {
    const { id } = status;
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

  it('delete', async () => {
    const { id } = status;

    const response = await app.inject({
      method: 'DELETE',
      url: `/statuses/${id}`,
    });

    expect(response.statusCode).toBe(302);

    const deletedStatus = await models.status.query().findById(id);
    expect(deletedStatus).toBeUndefined();
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
