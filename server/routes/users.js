// @ts-check
import fastifyPassport from 'fastify-passport';
import i18next from 'i18next';

export default (app) => {
  app

    .get('/users', { name: 'users' }, async (req, reply) => {
      // console.log('- get users req.user -', req.user);
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })

    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
    })

    .post('/users', async (req, reply) => {
      try {
        const user = await app.objection.models.user.fromJson(req.body.data);
        await app.objection.models.user.query().insert(user);

        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
        return reply;
      } catch (err) {
        console.log('- user create err -', err);
        const { data } = err;
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user: req.body.data, errors: data });
        return reply;
      }
    })

    .get(
      '/users/:id/edit',
      {
        name: 'editUser',
        // preValidation: app.authenticate,
        preValidation: fastifyPassport.authenticate('form', {
          failureFlash: i18next.t('flash.authError'),
          failureRedirect: '/users',
        }),
      },
      async (req, reply) => {
        // console.log('- get edit user req.user -', req.user);
        const { id } = req.params;
        const { user } = req;

        // if (!req.isAuthenticated()) {
        //   req.flash('error', i18next.t('flash.authError'));
        //   reply.redirect(app.reverse('users'));
        //   return reply;
        // }

        if (user.id !== Number(id)) {
          req.flash('error', i18next.t('flash.user.accessError'));
          reply.redirect(app.reverse('users'));
          return reply;
        }

        reply.render('users/edit', { user });
        return reply;
      }
    )

    .patch(
      '/users/:id',
      {
        name: 'patchUser',
        preValidation: fastifyPassport.authenticate('form', {
          failureFlash: i18next.t('flash.authError'),
          failureRedirect: '/users',
        }),
      },
      async (req, reply) => {
        console.log('- patch one user req.params -', req.params);
        const { id } = req.params;

        try {
          const formUser = await app.objection.models.user.fromJson(req.body.data);
          const dbUser = await app.objection.models.user.query().findById(id);
          await dbUser.$query().patch(formUser);

          req.flash('info', i18next.t('flash.users.update.succes'));
          reply.redirect(app.reverse('users'));
          return reply;
        } catch (err) {
          // console.log('- user update err -', err);
          const user = { id, ...req.body.data };

          req.flash('error', i18next.t('flash.users.update.error'));
          reply.render('/users/edit', { user, errors: err.data });
          return reply;
        }
      }
    )

    .delete(
      '/users/:id',
      {
        name: 'deleteUser',
        preValidation: fastifyPassport.authenticate('form', {
          failureFlash: i18next.t('flash.authError'),
          failureRedirect: '/users',
        }),
      },
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
          await app.objection.models.user.query().deleteById(id);

          req.logOut();
          req.flash('info', i18next.t('flash.users.delete.succes'));
          reply.redirect(app.reverse('users'));
          return reply;
        } catch (err) {
          console.log('- user delete err -', err);

          req.flash('error', i18next.t('flash.users.delete.error'));
          reply.redirect(app.reverse('users'));
          return reply;
        }
      }
    );
};
