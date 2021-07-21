import { Model } from 'objection';
import objectionUnique from 'objection-unique';
import path from 'path';

const unique = objectionUnique({ fields: ['name'] });

export default class Label extends unique(Model) {
  static get tableName() {
    return 'labels';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
      },
    };
  }

  static get relationMappings() {
    return {
      tasks: {
        relation: Model.ManyToManyRelation,
        modelClass: path.join(__dirname, 'Task.js'),
        join: {
          from: 'labels.id',
          through: {
            from: 'task_labels.label_id',
            to: 'task_labels.task_id',
          },
          to: 'tasks.id',
        },
      },
    };
  }
}
