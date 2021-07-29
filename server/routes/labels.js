// @ts-check
// import fastifyPassport from 'fastify-passport';
import i18next from 'i18next';

export default (app) => {
  app

    .get('/labels', { name: 'labels', preValidation: app.authenticate }, async (req, reply) => {
      try {
        const labels = await app.repositories.label.findAll();
        reply.render('labels/index', { labels });
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.serverError'));
        reply.redirect(app.reverse('root'));
        return reply;
      }
    })

    .get('/labels/new', { name: 'newLabel', preValidation: app.authenticate }, (req, reply) => {
      reply.render('labels/new');
      return reply;
    })

    .get('/labels/:id/edit', { name: 'editLabel', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;

      try {
        const label = await app.repositories.label.findById(id);
        reply.render('labels/edit', { label });
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.serverError'));
        reply.redirect(app.reverse('labels'));
        return reply;
      }
    })

    .post('/labels', { name: 'postLabel', preValidation: app.authenticate }, async (req, reply) => {
      try {
        await app.repositories.label.createOne(req.body.data);
        req.flash('info', i18next.t('flash.labels.create.success'));
        reply.redirect(app.reverse('labels'));
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.labels.create.error'));
        reply.render('labels/new', { label: req.body.data, errors: err.data });
        return reply;
      }
    })

    .patch('/labels/:id', { name: 'patchLabel', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const { data } = req.body;

      try {
        await app.repositories.label.patchById(id, data);
        req.flash('info', i18next.t('flash.labels.update.success'));
        reply.redirect(app.reverse('labels'));
        return reply;
      } catch (err) {
        const label = { id, ...req.body.data };
        req.flash('error', i18next.t('flash.labels.update.error'));
        reply.render('/labels/edit', { label, errors: err.data });
        return reply;
      }
    })

    .delete('/labels/:id', { name: 'deleteLabel', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;

      try {
        const label = await app.repositories.label.findById(id);

        if (label.tasks.length !== 0) {
          req.flash('error', i18next.t('flash.labels.delete.relateError'));
          reply.redirect(app.reverse('labels'));
          return reply;
        }

        await app.repositories.label.deleteById(id);
        req.flash('info', i18next.t('flash.labels.delete.success'));
        reply.redirect(app.reverse('labels'));
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.labels.delete.error'));
        reply.redirect(app.reverse('labels'));
        return reply;
      }
    });
};
