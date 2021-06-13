import { Model } from 'objection';
import objectionUnique from 'objection-unique';
import path from 'path';

import encrypt from '../lib/secure.js';

const unique = objectionUnique({ fields: ['email'] });

export default class User extends unique(Model) {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['firstName', 'lastName', 'email', 'password'],
      properties: {
        id: { type: 'integer' },
        firstName: { type: 'string', minLength: 1, maxLength: 255 },
        lastName: { type: 'string', minLength: 1, maxLength: 255 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 3 },
      },
    };
  }

  static get relationMappings() {
    return {
      taskCreator: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'Task.js'),
        join: {
          from: 'users.id',
          to: 'tasks.creatorId',
        },
      },
      taskExecutor: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'Task.js'),
        join: {
          from: 'users.id',
          to: 'tasks.executorId',
        },
      },
    };
  }

  set password(value) {
    this.passwordDigest = encrypt(value);
  }

  verifyPassword(password) {
    return encrypt(password) === this.passwordDigest;
  }

  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
