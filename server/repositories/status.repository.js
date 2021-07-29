/* eslint-disable no-param-reassign */

import makeRepository from './makeRepository.js';
import status from '../models/Status.js';

export default (app) => {
  app.repositories.status = makeRepository(status, 'tasks');
};
