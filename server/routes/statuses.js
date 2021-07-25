// @ts-check
// import fastifyPassport from 'fastify-passport';
import i18next from 'i18next';

export default (app) => {
  app

    .get(
      '/statuses',
      { name: 'statuses', preValidation: app.authenticate },
      async (req, reply) => {
        // console.log('- get /statuses req -', req);
        try {
          const statuses = await app.repositories.status.findAll();
          reply.render('statuses/index', { statuses });
          return reply;
        } catch (error) {
          // console.log('- get /statuses err -', err);
          req.flash('error', i18next.t('flash.serverError'));
          reply.redirect(app.reverse('root'));
          return reply;
        }
      }
    )

    .get('/statuses/new', { name: 'newStatus' }, (req, reply) => {
      // console.log('- get /statuses/new req -', req);
      reply.render('statuses/new');
      return reply;
    })

    .post('/statuses', async (req, reply) => {
      // console.log('- post /statuses req.body.data -', req.body.data);
      try {
        await app.repositories.status.createOne(req.body.data);
        req.flash('info', i18next.t('flash.statuses.create.success'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      } catch (err) {
        // console.log('- post /statuses err -', err);
        req.flash('error', i18next.t('flash.statuses.create.error'));
        reply.render('statuses/new', { status: req.body.data, errors: err.data });
        return reply;
      }
    })

    .get('/statuses/:id/edit', { name: 'editStatus' }, async (req, reply) => {
      // console.log('- get statuses/:id/edit req.params -', req.params);
      const { id } = req.params;
      try {
        const status = await app.repositories.status.findById(id);
        reply.render('statuses/edit', { status });
        return reply;
      } catch (err) {
        // console.log('- get statuses/:id/edit err -', err);
        req.flash('error', err.message);
        reply.redirect(app.reverse('statuses'));
        return reply;
      }
    })

    .patch('/statuses/:id', { name: 'patchStatus' }, async (req, reply) => {
      // console.log('- patch status req.params -', req.params);
      // console.log('- patch status req.body -', req.body);
      const { id } = req.params;
      const { data } = req.body;
      try {
        await app.repositories.status.patchById(id, data);
        req.flash('info', i18next.t('flash.statuses.update.success'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      } catch (err) {
        // console.log('- user update err -', err);
        const status = { id, ...data };
        req.flash('error', i18next.t('flash.statuses.update.error'));
        reply.render('/statuses/edit', { status, errors: err.data });
        return reply;
      }
    })

    .delete('/statuses/:id', { name: 'deleteStatus' }, async (req, reply) => {
      // console.log('- delete req.params -', req.params);
      const { id } = req.params;
      try {
        const status = await app.repositories.status.findById(id);

        if (status.tasks.length !== 0) {
          // console.log('- status delete err - tasks related');
          // throw new Error();
          req.flash('error', 'status delete error - tasks related');
          reply.redirect(app.reverse('statuses'));
          return reply;
        }

        await app.repositories.status.deleteById(id);
        req.flash('info', i18next.t('flash.statuses.delete.success'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      } catch (err) {
        // console.log('- status delete err -', err);
        req.flash('error', i18next.t('flash.statuses.delete.error'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      }
    });
};
