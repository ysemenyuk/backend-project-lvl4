import { Model } from 'objection';
import path from 'path';

// import objectionUnique from 'objection-unique';
// const unique = objectionUnique({ fields: ['name'] });

export default class Task extends Model {
  static get tableName() {
    return 'tasks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'creatorId', 'statusId'],
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
