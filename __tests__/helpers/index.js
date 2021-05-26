/* eslint-disable import/prefer-default-export */
import faker from 'faker';

export const getTestData = () => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
});
