/* eslint-disable no-param-reassign */
export default (app) => {
  app.repositories.status = {
    findAll: async () => {
      const { models } = app.objection;
      const statuses = await models.status.query().withGraphFetched('tasks');
      return statuses;
    },
    findById: async (id) => {
      const { models } = app.objection;
      const status = await models.status.query().findById(id).withGraphFetched('tasks');
      return status;
    },
    createOne: async (data) => {
      const { models } = app.objection;
      const formStatus = await models.status.fromJson(data);
      const status = await models.status.query().insert(formStatus);
      return status;
    },
    patchById: async (id, data) => {
      const { models } = app.objection;
      const formStatus = await models.status.fromJson(data);
      const dbStatus = await models.status.query().findById(id);
      await dbStatus.$query().patch(formStatus);
    },
    deleteById: async (id) => {
      const { models } = app.objection;
      await models.status.query().deleteById(id);
    },
  };
};
