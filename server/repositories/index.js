import status from './status.repository.js';
import label from './label.repository.js';

const repos = [status, label];

export default (app) => repos.forEach((f) => f(app));
