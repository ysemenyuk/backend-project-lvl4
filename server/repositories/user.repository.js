/* eslint-disable no-param-reassign */
export default (app) => {
  app.repositories.user = {
    findAll: async () => {
      const { models } = app.objection;
      const users = await models.user.query().withGraphFetched('[taskCreator, taskExecutor]');
      return users;
    },
    findById: async (id) => {
      const { models } = app.objection;
      const user = await models.user
        .query()
        .findById(id)
        .withGraphFetched('[taskCreator, taskExecutor]');
      return user;
    },
    createOne: async (data) => {
      const { models } = app.objection;
      const formUser = await models.user.fromJson(data);
      const user = await models.user.query().insert(formUser);
      return user;
    },
    patchById: async (id, data) => {
      const { models } = app.objection;
      const formuser = await models.user.fromJson(data);
      const dbuser = await models.user.query().findById(id);
      await dbuser.$query().patch(formuser);
    },
    deleteById: async (id) => {
      const { models } = app.objection;
      await models.user.query().deleteById(id);
    },
  };
};
