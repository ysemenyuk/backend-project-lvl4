// @ts-nocheck

import _ from 'lodash';
import getApp from '../server/index.js';
import encrypt from '../server/lib/secure.js';
import { getTestData } from './helpers/index.js';

describe('test users CRUD', () => {
  let app;
  let knex;
  let models;
  let user;

  const userData = getTestData();

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    user = await models.user.query().insert(userData);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('usersNew'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = getTestData();

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);

    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const dbUser = await models.user.query().findOne({ email: params.email });
    expect(dbUser).toMatchObject(expected);
  });

  it('update', async () => {
    const updatedData = { ...userData, firstName: 'updatedName' };

    const response = await app.inject({
      method: 'PATCH',
      url: `/users/${user.id}/edit`,
      payload: {
        data: updatedData,
      },
    });

    expect(response.statusCode).toBe(302);

    const expected = {
      ..._.omit(updatedData, 'password'),
      passwordDigest: encrypt(updatedData.password),
    };
    const dbUser = await models.user.query().findById(user.id);
    expect(dbUser).toMatchObject(expected);
  });

  it('delete', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/users/${user.id}`,
    });

    console.log('-------response------', response);

    expect(response.statusCode).toBe(302);

    const dbUser = await models.user.query().findById(user.id);

    console.log('-------dbUser------', dbUser);

    expect(dbUser).toBeUndefined();
  });

  afterEach(async () => {
    // после каждого теста откатываем миграции
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
