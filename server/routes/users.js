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
        preValidation: fastifyPassport.authenticate('form', {
          failureRedirect: '/',
          failureFlash: i18next.t('flash.authError'),
        }),
      },
      async (req, reply) => {
        // console.log('- get edit user req.user -', req.user);
        // console.log('- get edit user req.params -', req.params);

        if (req.user.id === Number(req.params.id)) {
          reply.render('users/edit', { user: req.user });
          return reply;
        }

        req.flash('error', 'You cannot edit or delete another user');
        reply.redirect(app.reverse('users'));
        return reply;
      }
    )
    .patch('/users/:id', { name: 'patchUser' }, async (req, reply) => {
      // console.log('- patch one user req.params -', req.params);
      // console.log('- patch one user req.body.data -', req.body.data);

      try {
        const user = await app.objection.models.user.fromJson(req.body.data);
        // console.log('- user -', user);

        const dbUser = await app.objection.models.user
          .query()
          .findById(req.params.id)
          .patch({ ...user });

        console.log(dbUser);

        req.flash('info', 'user updated');
        reply.redirect(app.reverse('users'));
        return reply;
      } catch (err) {
        // const { data } = err;
        console.log('- err -', err);

        req.flash('error', 'user update error');
        reply.redirect(app.reverse('users'));
        // reply.render('/users/edit', { user: req.body.data, errors: data });
        return reply;
      }
    })
    .delete(
      '/users/:id',
      {
        name: 'deleteUser',
        preValidation: fastifyPassport.authenticate('form', {
          failureRedirect: '/',
          failureFlash: i18next.t('flash.authError'),
        }),
      },
      async (req, reply) => {
        // console.log('- delete req.params -', req.params);

        if (req.user.id === Number(req.params.id)) {
          await app.objection.models.user.query().deleteById(req.params.id);

          req.flash('info', 'user deleted');
          reply.redirect(app.reverse('users'));
          return reply;
        }

        req.flash('error', 'You cannot edit or delete another user');
        reply.redirect(app.reverse('users'));
        return reply;
      }
    );
};
