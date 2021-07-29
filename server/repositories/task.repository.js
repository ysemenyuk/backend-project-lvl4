/* eslint-disable no-param-reassign */
export default (app) => {
  app.repositories.task = {
    findAll: async (query, user) => {
      const { models, knex } = app.objection;
      const {
        status, executor, label, isCreatorUser,
      } = query;

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

      const formTaskData = models.task.prepareData(data, user);

      const formTask = await models.task.fromJson(formTaskData);
      formTask.labels = models.task.prepareLabels(data);

      await models.task.transaction(async (trx) => {
        await models.task.query(trx).insertGraph(formTask, { relate: ['labels'] });
      });

      return formTask;
    },
    patchById: async (id, data) => {
      const { models } = app.objection;

      const dbTask = await models.task.query().findById(id);

      const updatedData = models.task.prepareData(data);

      updatedData.labels = models.task.prepareLabels(data);
      updatedData.creatorId = dbTask.creatorId;
      updatedData.id = dbTask.id;

      await models.task.transaction(async (trx) => {
        await models.task.query(trx).upsertGraph(updatedData, {
          relate: true,
          update: true,
          unrelate: true,
        });
      });

      // return formTask;
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
