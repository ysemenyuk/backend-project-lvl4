import status from './status.repository.js';
import label from './label.repository.js';
import task from './task.repository.js';
import user from './user.repository.js';

const repos = [status, label, task, user];

export default (app) => repos.forEach((f) => f(app));
