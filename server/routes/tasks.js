// @ts-check
// import fastifyPassport from 'fastify-passport';
import i18next from 'i18next';

export default (app) => {
  app
    .get(
      '/tasks',
      { name: 'tasks', preValidation: app.authenticate },
      async (req, reply) => {
        // console.log('- get /tasks req -', req);
        const tasks = await app.objection.models.task.query();
        console.log('-- tasks --', tasks);
        reply.render('tasks/index', { tasks });
        return reply;
      }
    )

    .get('/tasks/new', { name: 'newTask' }, (req, reply) => {
      // console.log('- get /statuses/new req -', req);
      reply.render('tasks/new');
      return reply;
    })

    .get('/tasks/:id', { name: 'task' }, async (req, reply) => {
      // console.log('- get /task req -', req);
      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id);
      console.log('-- task --', task);
      reply.render('tasks/one', { task });
      return reply;
    })

    .post('/tasks', async (req, reply) => {
      try {
        const task = await app.objection.models.task.fromJson(req.body.data);
        await app.objection.models.task.query().insert(task);

        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        console.log('- task create err -', err);
        const { data } = err;
        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', { task: req.body.data, errors: data });
        return reply;
      }
    })

    .get('/tasks/:id/edit', { name: 'editTask' }, async (req, reply) => {
      // console.log('- get edit user req.user -', req.user);
      const { id } = req.params;
      const task = await app.objection.models.tasks.query().findById(id);

      reply.render('tasks/edit', { task });
      return reply;
    })

    .patch('/statuses/:id', { name: 'patchTask' }, async (req, reply) => {
      // console.log('- patch status req.params -', req.params);
      // console.log('- patch status req.body -', req.body);
      const { id } = req.params;

      try {
        const task = await app.objection.models.tasks.fromJson(req.body.data);
        const dbTask = await app.objection.models.tasks.query().findById(id);
        await dbTask.$query().patch(task);

        req.flash('info', 'task updated succes');
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        // console.log('- user update err -', err);
        const task = { id, ...req.body.data };

        req.flash('error', 'task update error');
        reply.render('/tasks/edit', { task, errors: err.data });
        return reply;
      }
    })

    .delete('/tasks/:id', { name: 'deleteTask' }, async (req, reply) => {
      // console.log('- delete req.params -', req.params);
      const { id } = req.params;

      try {
        await app.objection.models.tasks.query().deleteById(id);

        req.flash('info', 'task deleted succes');
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        console.log('- status delete err -', err);

        req.flash('error', 'task delete error');
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
    });
};
