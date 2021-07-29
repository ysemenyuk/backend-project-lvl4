/* eslint-disable no-param-reassign */

import makeRepository from './makeRepository.js';
import user from '../models/User.js';

export default (app) => {
  app.repositories.user = makeRepository(user, '[taskCreator, taskExecutor]');
};
