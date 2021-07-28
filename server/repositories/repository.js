class Repository {
  constructor(model) {
    this.model = model;
  }

  async findAll(relation) {
    const entity = await this.model.query().withGraphFetched(relation);
    return entity;
  }
}

export default Repository;
