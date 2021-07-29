/* eslint-disable no-param-reassign */

import makeRepository from './makeRepository.js';
import label from '../models/Label.js';

export default (app) => {
  app.repositories.label = makeRepository(label, 'tasks');
};
