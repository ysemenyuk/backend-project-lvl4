// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/:id/edit', { name: 'editUser' }, async (req, reply) => {
      console.log(111, 'get one user req.params', req.params);
      const user = await app.objection.models.user.query().findById(req.params.id);

      console.log(111, user);
      reply.render('users/edit', { user });
      return reply;
    })
    .patch('/users/:id', { name: 'patchUser' }, async (req, reply) => {
      console.log(444, 'get one user req.params', req.params);
      console.log(444, 'get one user req.body.data', req.body.data);

      // const user = await app.objection.models.user.query().findById(req.params.id).patch({
      //   firstName: req.body.data.firstName,
      //   lastName: req.body.data.lastName,
      // });

      // console.log(444, user);

      req.flash('info', 'user updated');
      reply.redirect(app.reverse('users'));
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
    })
    .delete('/users/:id', { name: 'deleteUser' }, async (req, reply) => {
      console.log(222, 'delete req.params', req.params);

      const user = await app.objection.models.user.query().deleteById(req.params.id);
      console.log(222, user);

      req.flash('info', 'user deleted');
      reply.redirect(app.reverse('users'));
      return reply;
    })
    .post('/users', async (req, reply) => {
      try {
        const user = await app.objection.models.user.fromJson(req.body.data);
        console.log(1, user);

        const dbUser = await app.objection.models.user.query().insert(user);
        console.log(2, dbUser);

        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
        return reply;
      } catch (err) {
        const { data } = err;
        console.log(3, err);
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user: req.body.data, errors: data });
        return reply;
      }
    });
};
