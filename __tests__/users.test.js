// @ts-nocheck

import _ from 'lodash';
import getApp from '../server/index.js';
import encrypt from '../server/lib/secure.js';
import { generateEntity, insertEntity } from './helpers/index.js';

const userData1 = generateEntity('user');
const userData2 = generateEntity('user');

describe('test users CRUD', () => {
  let app;
  let knex;
  let models;

  let user1;
  let user2;

  let cookie;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    user1 = await insertEntity('user', models.user, userData1);
    user2 = await insertEntity('user', models.user, userData2);

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
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const newUser = generateEntity('user');

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: {
        data: newUser,
      },
    });

    expect(response.statusCode).toBe(302);

    const expected = {
      ..._.omit(newUser, 'password'),
      passwordDigest: encrypt(newUser.password),
    };
    const dbUser = await models.user.query().findOne({ email: newUser.email });
    expect(dbUser).toMatchObject(expected);
  });

  it('edit', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/users/${user1.id}/edit`,
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('update', async () => {
    const updatedData = { ...userData1, firstName: 'updatedName' };

    const response = await app.inject({
      method: 'PATCH',
      url: `/users/${user1.id}`,
      cookies: cookie,
      payload: {
        data: updatedData,
      },
    });

    expect(response.statusCode).toBe(302);

    const expected = {
      ..._.omit(updatedData, 'password'),
      passwordDigest: encrypt(updatedData.password),
    };
    const dbUser = await models.user.query().findById(user1.id);
    expect(dbUser).toMatchObject(expected);
  });

  it('delete', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/users/${user1.id}`,
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const dbUser = await models.user.query().findById(user1.id);

    expect(dbUser).toBeUndefined();
  });

  it('delete error', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/users/${user2.id}`,
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const dbUser = await models.user.query().findById(user2.id);

    expect(dbUser).toMatchObject(user2);
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
