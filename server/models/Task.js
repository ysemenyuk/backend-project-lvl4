import { Model } from 'objection';
import path from 'path';
import _ from 'lodash';

// import objectionUnique from 'objection-unique';
// const unique = objectionUnique({ fields: ['name'] });

export default class Task extends Model {
  static get tableName() {
    return 'tasks';
  }

  static prepareData(data, user) {
    const { name, description, statusId, executorId } = data;
    const taskData = {
      name,
      description,
      creatorId: user.id,
      statusId: statusId ? Number(statusId) : null,
      executorId: executorId ? Number(executorId) : null,
    };

    return _.omitBy(taskData, _.isNull);
  }

  static prepareLabels(data) {
    let labels;
    if (Array.isArray(data.labels)) {
      labels = data.labels;
    } else if (data.labels) {
      labels = [data.labels];
    } else {
      labels = [];
    }

    return labels.map((value) => ({ id: value }));
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

  static get modifiers() {
    return {
      filterByStatus(query, statusId) {
        if (statusId) query.where('statusId', statusId);
      },
      filterByExecutor(query, executorId) {
        if (executorId) query.where('executorId', executorId);
      },
      filterByLabel(query, labelId, knex) {
        if (labelId) {
          query.whereExists(
            knex('tasks_labels')
              .whereRaw('tasks_labels.task_id = tasks.id')
              .where('label_id ', labelId)
          );
        }
      },
      filterByCreator(query, isCreatorUser, userId) {
        if (isCreatorUser) query.where('creatorId', userId);
      },
    };
  }
}
