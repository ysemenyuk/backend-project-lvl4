// @ts-check

import i18next from 'i18next';

export default (app) => {
  app

    .get('/statuses', { name: 'statuses', preValidation: app.authenticate },
      async (req, reply) => {
        try {
          const statuses = await app.repositories.status.findAll();
          reply.render('statuses/index', { statuses });
          return reply;
        } catch (error) {
          req.flash('error', i18next.t('flash.serverError'));
          reply.redirect(app.reverse('root'));
          return reply;
        }
      })

    .get('/statuses/new', { name: 'newStatus', preValidation: app.authenticate }, (req, reply) => {
      reply.render('statuses/new');
      return reply;
    })

    .get('/statuses/:id/edit', { name: 'editStatus', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;

      try {
        const status = await app.repositories.status.findById(id);
        reply.render('statuses/edit', { status });
        return reply;
      } catch (err) {
        req.flash('error', err.message);
        reply.redirect(app.reverse('statuses'));
        return reply;
      }
    })

    .post('/statuses', { name: 'postStatus', preValidation: app.authenticate }, async (req, reply) => {
      try {
        await app.repositories.status.createOne(req.body.data);
        req.flash('info', i18next.t('flash.statuses.create.success'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.statuses.create.error'));
        reply.render('statuses/new', { status: req.body.data, errors: err.data });
        return reply;
      }
    })

    .patch('/statuses/:id', { name: 'patchStatus', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const { data } = req.body;

      try {
        await app.repositories.status.patchById(id, data);
        req.flash('info', i18next.t('flash.statuses.update.success'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      } catch (err) {
        const status = { id, ...data };
        req.flash('error', i18next.t('flash.statuses.update.error'));
        reply.render('/statuses/edit', { status, errors: err.data });
        return reply;
      }
    })

    .delete('/statuses/:id', { name: 'deleteStatus', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;

      try {
        const status = await app.repositories.status.findById(id);

        if (status.tasks.length !== 0) {
          req.flash('error', i18next.t('flash.statuses.delete.relateError'));
          reply.redirect(app.reverse('statuses'));
          return reply;
        }

        await app.repositories.status.deleteById(id);
        req.flash('info', i18next.t('flash.statuses.delete.success'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.statuses.delete.error'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      }
    });
};
