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
          const statuses = await app.objection.models.status.query();
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
        const status = await app.objection.models.status.fromJson(req.body.data);
        await app.objection.models.status.query().insert(status);

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
        const status = await app.objection.models.status.query().findById(id);

        reply.render('statuses/edit', { status });
        return reply;
      } catch (err) {
        // console.log('- get statuses/:id/edit err -', err);

        req.flash('error', i18next.t('flash.serverError'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      }
    })

    .patch('/statuses/:id', { name: 'patchStatus' }, async (req, reply) => {
      // console.log('- patch status req.params -', req.params);
      // console.log('- patch status req.body -', req.body);
      const { id } = req.params;

      try {
        const formStatus = await app.objection.models.status.fromJson(req.body.data);
        const dbStatus = await app.objection.models.status.query().findById(id);
        await dbStatus.$query().patch(formStatus);

        req.flash('info', i18next.t('flash.statuses.update.succes'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      } catch (err) {
        // console.log('- user update err -', err);
        const status = { id, ...req.body.data };

        req.flash('error', i18next.t('flash.statuses.update.error'));
        reply.render('/statuses/edit', { status, errors: err.data });
        return reply;
      }
    })

    .delete('/statuses/:id', { name: 'deleteStatus' }, async (req, reply) => {
      // console.log('- delete req.params -', req.params);
      const { id } = req.params;

      try {
        await app.objection.models.status.query().deleteById(id);

        req.flash('info', i18next.t('flash.statuses.delete.succes'));
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
