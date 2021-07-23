/* eslint-disable import/prefer-default-export */
import faker from 'faker';

const getUser = () => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
});

const getStatus = () => ({
  name: faker.random.word(),
});

const getLabel = () => ({
  name: faker.random.word(),
});

const getTask = () => ({
  name: faker.random.word(),
  description: faker.random.word(),
});

export default { getUser, getStatus, getLabel, getTask };
