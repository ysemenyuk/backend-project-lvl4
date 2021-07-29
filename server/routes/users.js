// @ts-check
// import fastifyPassport from 'fastify-passport';
import i18next from 'i18next';

export default (app) => {
  app

    .get('/users', { name: 'users' }, async (req, reply) => {
      // console.log('- get users req.user -', req.user);
      try {
        const users = await app.repositories.user.findAll();
        reply.render('users/index', { users });
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.serverError'));
        reply.redirect(app.reverse('root'));
        return reply;
      }
    })

    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      reply.render('users/new', { user: {} });
    })

    .post('/users', async (req, reply) => {
      try {
        await app.repositories.user.createOne(req.body.data);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
        return reply;
      } catch (err) {
        // console.log('- user create err -', err);
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user: req.body.data, errors: err.data });
        return reply;
      }
    })

    .get('/users/:id/edit', { name: 'editUser', preValidation: app.authenticate },
      async (req, reply) => {
        // console.log('- get edit user req.user -', req.user);
        const { id } = req.params;
        const { user } = req;

        if (user.id !== Number(id)) {
          req.flash('error', i18next.t('flash.users.accessError'));
          reply.redirect(app.reverse('users'));
          return reply;
        }

        reply.render('users/edit', { user });
        return reply;
      })

    .patch('/users/:id', { name: 'patchUser', preValidation: app.authenticate },
      async (req, reply) => {
        // console.log('- patch one user req.params -', req.params);
        const { id } = req.params;

        try {
          await app.repositories.user.patchById(id, req.body.data);
          req.flash('info', i18next.t('flash.users.update.success'));
          reply.redirect(app.reverse('users'));
          return reply;
        } catch (err) {
          // console.log('- user update err -', err);
          const user = { id, ...req.body.data };
          req.flash('error', i18next.t('flash.users.update.error'));
          reply.render('/users/edit', { user, errors: err.data });
          return reply;
        }
      })

    .delete('/users/:id', { name: 'deleteUser', preValidation: app.authenticate },
      async (req, reply) => {
        // console.log('- delete req.params -', req.params, req.user);
        const { id } = req.params;
        const { user } = req;

        if (user.id !== Number(id)) {
          req.flash('error', i18next.t('flash.users.accessError'));
          reply.redirect(app.reverse('users'));
          return reply;
        }

        try {
          const dbUser = await app.repositories.user.findById(id);

          if (dbUser.taskCreator.length !== 0 || dbUser.taskExecutor.length !== 0) {
            // console.log('- status delete err - tasks related');
            req.flash('error', 'user delete error - tasks related');
            reply.redirect(app.reverse('users'));
            return reply;
          }

          await app.repositories.user.deleteById(id);
          req.logOut();
          req.flash('info', i18next.t('flash.users.delete.success'));
          reply.redirect(app.reverse('users'));
          return reply;
        } catch (err) {
          // console.log('- user delete err -', err);
          req.flash('error', i18next.t('flash.users.delete.error'));
          reply.redirect(app.reverse('users'));
          return reply;
        }
      });
};
