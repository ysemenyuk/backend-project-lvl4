import { Model } from 'objection';
import path from 'path';

// import objectionUnique from 'objection-unique';
// const unique = objectionUnique({ fields: ['name'] });

export default class Task extends Model {
  static get tableName() {
    return 'tasks';
  }

  static get modifiers() {
    return {
      defaultSelect(query) {
        query();
      },
      filterStatus(query, statusId) {
        if (statusId) query.where('statusId', statusId);
      },
      filterExecutor(query, executorId) {
        if (executorId) query.where('executorId', executorId);
      },
      filterLabel(query, labelId, knex) {
        if (labelId) {
          query.whereExists(
            knex('tasks_labels')
              .whereRaw('tasks_labels.task_id = tasks.id')
              .where('label_id ', labelId)
          );
        }
      },
      filterCreator(query, isCreatorUser, userId) {
        if (isCreatorUser) query.where('creatorId', userId);
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'statusId', 'creatorId'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: 'string' },
        statusId: { type: 'integer' },
        creatorId: { type: 'integer' },
        executorId: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    return {
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'User.js'),
        join: {
          from: 'tasks.creatorId',
          to: 'users.id',
        },
      },
      executor: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'User.js'),
        join: {
          from: 'tasks.executorId',
          to: 'users.id',
        },
      },
      status: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'Status.js'),
        join: {
          from: 'tasks.statusId',
          to: 'statuses.id',
        },
      },
      labels: {
        relation: Model.ManyToManyRelation,
        modelClass: path.join(__dirname, 'Label.js'),
        join: {
          from: 'tasks.id',
          through: {
            from: 'tasks_labels.task_id',
            to: 'tasks_labels.label_id',
          },
          to: 'labels.id',
        },
      },
    };
  }
}
