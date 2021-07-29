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

const generateEntitis = () => ({
  user: generateEntity('user'),
  status: generateEntity('status'),
  label: generateEntity('label'),
  task: generateEntity('task'),
});

const insertEntitis = async (models, data) => {
  const entitis = {};
  entitis.user = await insertEntity('user', models.user, data.user);
  entitis.status = await insertEntity('status', models.status, data.status);
  entitis.label = await insertEntity('label', models.label, data.label);

  if (data.task) {
    const taskData = data.task;
    taskData.creatorId = entitis.user.id;
    taskData.statusId = entitis.status.id;
    taskData.labels = [{ id: entitis.label.id }];

    entitis.task = await insertEntity('task', models.task, taskData);
  }

  return entitis;
};

export {
  generateEntity, insertEntity, generateEntitis, insertEntitis,
};
