import statusRepository from './status.repository.js';

// const repos = [statusRepository];

// export default (app) => repos.forEach((f) => f(app));

export default (app) => statusRepository(app);
