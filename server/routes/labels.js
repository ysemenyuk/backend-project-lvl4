// @ts-check
// import fastifyPassport from 'fastify-passport';
import i18next from 'i18next';

export default (app) => {
  app

    .get('/labels', { name: 'labels', preValidation: app.authenticate }, async (req, reply) => {
      // console.log('- get /labels req -', req);
      try {
        const labels = await app.repositories.label.findAll();
        reply.render('labels/index', { labels });
        return reply;
      } catch (err) {
        // console.log('- get /labels err -', err);
        req.flash('error', i18next.t('flash.serverError'));
        reply.redirect(app.reverse('root'));
        return reply;
      }
    })

    .get('/labels/new', { name: 'newLabel' }, (req, reply) => {
      // console.log('- get /labels/new req -', req);
      reply.render('labels/new');
      return reply;
    })

    .post('/labels', async (req, reply) => {
      // console.log('- post /labels req.body.data -', req.body.data);
      try {
        await app.repositories.label.createOne(req.body.data);
        req.flash('info', i18next.t('flash.labels.create.success'));
        reply.redirect(app.reverse('labels'));
        return reply;
      } catch (err) {
        // console.log('- post /labels err -', err);
        req.flash('error', i18next.t('flash.labels.create.error'));
        reply.render('labels/new', { label: req.body.data, errors: err.data });
        return reply;
      }
    })

    .get('/labels/:id/edit', { name: 'editLabel' }, async (req, reply) => {
      // console.log('- get labels/:id/edit req.params -', req.params);
      const { id } = req.params;
      try {
        const label = await app.repositories.label.findById(id);
        reply.render('labels/edit', { label });
        return reply;
      } catch (err) {
        // console.log('- get labels/:id/edit err -', err);
        req.flash('error', i18next.t('flash.serverError'));
        reply.redirect(app.reverse('labels'));
        return reply;
      }
    })

    .patch('/labels/:id', { name: 'patchLabel' }, async (req, reply) => {
      // console.log('- patch label req.params -', req.params);
      // console.log('- patch label req.body.data -', req.body.data);
      const { id } = req.params;
      const { data } = req.body;
      try {
        await app.repositories.label.patchById(id, data);
        req.flash('info', i18next.t('flash.labels.update.success'));
        reply.redirect(app.reverse('labels'));
        return reply;
      } catch (err) {
        // console.log('- user update err -', err);
        const label = { id, ...req.body.data };
        req.flash('error', i18next.t('flash.labels.update.error'));
        reply.render('/labels/edit', { label, errors: err.data });
        return reply;
      }
    })

    .delete('/labels/:id', { name: 'deleteLabel' }, async (req, reply) => {
      // console.log('- delete req.params -', req.params);
      const { id } = req.params;
      try {
        const label = await app.repositories.label.findById(id);

        if (label.tasks.length !== 0) {
          // console.log('- status delete err - tasks related');
          // throw new Error();
          req.flash('error', 'label delete error - tasks related');
          reply.redirect(app.reverse('labels'));
          return reply;
        }

        await app.repositories.label.deleteById(id);
        req.flash('info', i18next.t('flash.labels.delete.succes'));
        reply.redirect(app.reverse('labels'));
        return reply;
      } catch (err) {
        // console.log('- label delete err -', err);
        req.flash('error', i18next.t('flash.labels.delete.error'));
        reply.redirect(app.reverse('labels'));
        return reply;
      }
    });
};
