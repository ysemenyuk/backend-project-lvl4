// @ts-nocheck
import _ from 'lodash';
import getApp from '../server/index.js';
import { generateEntity, generateEntitis, insertEntitis } from './helpers/index.js';

const data1 = generateEntitis();
const data2 = generateEntitis();

const mapping = [['status', 'statuses'], ['label', 'labels']];

describe('test status/label CRUD', () => {
  let app;
  let knex;
  let models;

  let entitis1;
  let entitis2;

  let cookie;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();

    const data = _.omit(data1, 'task');
    entitis1 = await insertEntitis(models, data);
    entitis2 = await insertEntitis(models, data2);

    const { email, password } = data1.user;

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

  test.each(mapping)('create name %s route %s', async (name, route) => {
    const newEntity = generateEntity(name);
    const response = await app.inject({
      method: 'POST',
      url: app.reverse(route),
      cookies: cookie,
      payload: {
        data: newEntity,
      },
    });
    expect(response.statusCode).toBe(302);
    const createdEntity = await models[name].query().findOne({ name: newEntity.name });
    expect(createdEntity).toMatchObject(newEntity);
  });

  test.each(mapping)('create error name %s route %s', async (name, route) => {
    const newEntity = { name: '' };
    const response = await app.inject({
      method: 'POST',
      url: app.reverse(route),
      cookies: cookie,
      payload: {
        data: newEntity,
      },
    });

    expect(response.statusCode).toBe(200);

    const createdEntity = await models.status.query().findOne({ name: newEntity.name });

    expect(createdEntity).toBeUndefined();
  });

  test.each(mapping)('update name %s route %s', async (name, route) => {
    const { id } = entitis1[name];
    const updateForm = { name: 'newName' };

    const response = await app.inject({
      method: 'PATCH',
      url: `/${route}/${id}`,
      cookies: cookie,
      payload: {
        data: updateForm,
      },
    });

    expect(response.statusCode).toBe(302);

    const updatedEntity = await models[name].query().findOne({ name: updateForm.name });
    expect(updatedEntity).toMatchObject(updateForm);
  });

  test.each(mapping)('update error name %s route %s', async (name, route) => {
    const { id } = entitis1[name];
    const updateForm = { name: '' };

    const response = await app.inject({
      method: 'PATCH',
      url: `/${route}/${id}`,
      cookies: cookie,
      payload: {
        data: updateForm,
      },
    });

    expect(response.statusCode).toBe(200);

    const updatedEntity = await models[name].query().findOne({ name: updateForm.name });
    expect(updatedEntity).toBeUndefined();
  });

  test.each(mapping)('delete name %s route %s', async (name, route) => {
    const { id } = entitis1[name];

    const response = await app.inject({
      method: 'DELETE',
      url: `/${route}/${id}`,
    });

    expect(response.statusCode).toBe(302);

    const deletedEntity = await models[name].query().findById(id);
    expect(deletedEntity).toBeUndefined();
  });

  test.each(mapping)('delete error name %s route %s', async (name, route) => {
    const { id } = entitis2[name];

    const response = await app.inject({
      method: 'DELETE',
      url: `/${route}/${id}`,
    });

    expect(response.statusCode).toBe(302);

    const deletedEntity = await models[name].query().findById(id);
    expect(deletedEntity).toMatchObject(entitis2[name]);
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
