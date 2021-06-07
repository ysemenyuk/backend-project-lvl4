// @ts-check
// import i18next from 'i18next';
import Status from '../models/Status.js';

export default (app) => {
  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      // console.log('- get /statuses req -', req);
      // const users = await app.objection.models.user.query();
      // const statuses = await app.objection.models.status.query();

      // @ts-ignore
      const statuses = await Status.query();
      reply.render('statuses/index', { statuses });
      return reply;
    })
    .get('/statuses/new', { name: 'newStatus' }, (req, reply) => {
      // console.log('- get /statuses/new req -', req);

      reply.render('statuses/new');
      return reply;
    });
};
