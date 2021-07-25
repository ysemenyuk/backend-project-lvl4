/* eslint-disable no-param-reassign */
export default (app) => {
  app.repositories.label = {
    findAll: async () => {
      const { models } = app.objection;
      const labels = await models.label.query().withGraphFetched('tasks');
      return labels;
    },
    findById: async (id) => {
      const { models } = app.objection;
      const label = await models.label.query().findById(id).withGraphFetched('tasks');
      return label;
    },
    createOne: async (data) => {
      const { models } = app.objection;
      const formlabel = await models.label.fromJson(data);
      const label = await models.label.query().insert(formlabel);
      return label;
    },
    patchById: async (id, data) => {
      const { models } = app.objection;
      const formlabel = await models.label.fromJson(data);
      const dblabel = await models.label.query().findById(id);
      await dblabel.$query().patch(formlabel);
    },
    deleteById: async (id) => {
      const { models } = app.objection;
      await models.label.query().deleteById(id);
    },
  };
};
