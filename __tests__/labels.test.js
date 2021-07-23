// @ts-nocheck

import getApp from '../server/index.js';
import testData from './helpers/index.js';

describe('test labels CRUD', () => {
  let app;
  let knex;
  let models;
  let label;

  let cookie;

  const userData = testData.getUser();
  const labelData = testData.getLabel();

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await models.user.query().insert(userData);
    label = await models.label.query().insert(labelData);

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
    const newLabel = testData.getLabel();

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

  it('update', async () => {
    const { id } = label;
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

  it('delete', async () => {
    const { id } = label;

    const response = await app.inject({
      method: 'DELETE',
      url: `/labels/${id}`,
    });

    expect(response.statusCode).toBe(302);

    const deletedLabel = await models.label.query().findById(id);
    expect(deletedLabel).toBeUndefined();
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
