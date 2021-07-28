import faker from 'faker';

const generateEntity = (type) => {
  switch (type) {
    case 'user':
      return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
    case 'status':
    case 'label':
      return {
        name: faker.random.word(),
      };
    case 'task':
      return {
        name: faker.random.word(),
        description: faker.random.word(),
      };
    default:
      throw new Error(`unknown type ${type}`);
  }
};

const insertEntity = async (type, model, data) => {
  let entity;
  switch (type) {
    case 'user':
    case 'status':
    case 'label':
      entity = await model.query().insert(data);
      return entity;
    case 'task':
      await model.transaction(async (trx) => {
        entity = await model.query(trx).insertGraph(data, { relate: ['labels'] });
      });
      return entity;
    default:
      throw new Error(`unknown type ${type}`);
  }
};

export {
  generateEntity, insertEntity,
};
