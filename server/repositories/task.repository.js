/* eslint-disable no-param-reassign */
export default (app) => {
  app.repositories.task = {
    findAll: async (query, user) => {
      const { models, knex } = app.objection;
      const { status, executor, label, isCreatorUser } = query;

      const tasks = await models.task
        .query()
        .withGraphFetched('[status, creator, executor, labels]')
        .modify('filterByStatus', status)
        .modify('filterByExecutor', executor)
        .modify('filterByLabel', label, knex)
        .modify('filterByCreator', isCreatorUser, user.id)
        .orderBy('id');

      return tasks;
    },
    findById: async (id) => {
      const { models } = app.objection;

      const task = await models.task
        .query()
        .findById(id)
        .withGraphFetched('[status, creator, executor, labels]');

      return task;
    },
    createOne: async (data, user) => {
      const { models } = app.objection;

      const formLabels = data.labels || null;
      const formTaskData = models.task.prepareData(data, user);

      const task = await models.task.fromJson(formTaskData);

      await models.task.transaction(async (trx) => {
        await models.task.query(trx).insert(task);
        await task.$relatedQuery('labels', trx).relate(formLabels);
      });

      return task;
    },
    patchById: async (id, data, user) => {
      const { models } = app.objection;

      const formLabels = data.labels || null;
      const formTaskData = models.task.prepareData(data, user);

      const formTask = await models.task.fromJson(formTaskData);
      const dbTask = await models.task.query().findById(id);

      await models.task.transaction(async (trx) => {
        await dbTask.$query(trx).patch(formTask);
        await dbTask.$relatedQuery('labels', trx).unrelate();
        await dbTask.$relatedQuery('labels', trx).relate(formLabels);
      });

      return dbTask;
    },
    deleteById: async (id) => {
      const { models } = app.objection;

      await models.task.transaction(async (trx) => {
        await models.task.relatedQuery('labels', trx).for(id).unrelate();
        await models.task.query(trx).deleteById(id);
      });
    },
  };
};
