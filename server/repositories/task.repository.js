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

      // console.log(111, task);

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

      // return formTask;
    },
    patchById: async (id, data, user) => {
      const { models } = app.objection;

      const formTaskData = models.task.prepareData(data, user);

      const formTask = await models.task.fromJson(formTaskData);
      formTask.labels = models.task.prepareLabels(data);

      const dbTask = await models.task.query().findById(id);
      formTask.id = dbTask.id;

      await models.task.transaction(async (trx) => {
        await models.task.query(trx).upsertGraph(formTask, {
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
