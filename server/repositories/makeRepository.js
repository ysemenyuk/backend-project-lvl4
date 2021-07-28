export default (model, relation) => ({
  findAll: async () => {
    const entity = await model.query().withGraphFetched(relation);
    return entity;
  },
  findById: async (id) => {
    const entity = await model.query().findById(id).withGraphFetched(relation);
    return entity;
  },
  createOne: async (data) => {
    const formData = await model.fromJson(data);
    const entity = await model.query().insert(formData);
    return entity;
  },
  patchById: async (id, data) => {
    const formData = await model.fromJson(data);
    const dbEntity = await model.query().findById(id);
    await dbEntity.$query().patch(formData);
  },
  deleteById: async (id) => {
    await model.query().deleteById(id);
  },
});
