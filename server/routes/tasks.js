// @ts-check
// import fastifyPassport from 'fastify-passport';
import i18next from 'i18next';

export default (app) => {
  app
    .get('/tasks', { name: 'tasks', preValidation: app.authenticate }, async (req, reply) => {
      try {
        // console.log('- get /tasks req -', req);
        const tasks = await app.objection.models.task
          .query()
          .withGraphJoined('[status, creator, executor]');
        // console.log('-- tasks --', tasks);
        reply.render('tasks/index', { tasks });
        return reply;
      } catch (err) {
        console.log('catch err', err);
        return reply;
      }
    })

    .get('/tasks/:id', { name: 'task', preValidation: app.authenticate }, async (req, reply) => {
      // console.log('- get /task req -', req);
      try {
        const { id } = req.params;

        const task = await app.objection.models.task
          .query()
          .findById(id)
          .withGraphJoined('[status, creator, executor]');

        reply.render('tasks/one', { task });
        return reply;
      } catch (err) {
        console.log('-- err --', err);
        return reply;
      }
    })

    .get('/tasks/new', { name: 'newTask' }, async (req, reply) => {
      try {
        const executors = await app.objection.models.user.query();
        const statuses = await app.objection.models.status.query();

        reply.render('tasks/new', { task: {}, errors: {}, executors, statuses });
        return reply;
      } catch (err) {
        console.log('-- err --', err);
        return reply;
      }
    })

    .post('/tasks', async (req, reply) => {
      console.log('---post tasks req.body.data---', req.body.data);

      const { name, description, statusId, executorId } = req.body.data;

      const taskData = {
        name,
        description,
        statusId: statusId ? Number(statusId) : null,
        executorId: executorId ? Number(executorId) : null,
        creatorId: req.user.id,
      };

      console.log('---post tasks taskData---', taskData);

      try {
        const task = await app.objection.models.task.fromJson(taskData);
        await app.objection.models.task.query().insert(task);

        console.log('---post tasks task---', task);

        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        console.log('- task create err -', err.data);

        const executors = await app.objection.models.user.query();
        const statuses = await app.objection.models.status.query();

        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', {
          task: taskData,
          errors: err.data,
          executors,
          statuses,
        });
        return reply;
      }
    })

    .get('/tasks/:id/edit', { name: 'editTask' }, async (req, reply) => {
      try {
        console.log('- get edit user req.errr -', req);
        // console.log('- get edit status req.params -', req.params);

        const { id } = req.params;
        const task = await app.objection.models.task.query().findById(id);
        // console.log('-- task --', task);

        const executors = await app.objection.models.user.query();
        const statuses = await app.objection.models.status.query();

        reply.render('tasks/edit', { task, errors: {}, executors, statuses });
        return reply;
      } catch (err) {
        console.log('catch err', err);
        return reply;
      }
    })

    .patch('/tasks/:id', { name: 'patchTask' }, async (req, reply) => {
      console.log('---- patch task req.params -', req.params);
      console.log('---- patch task req.body.data', req.body.data);

      const { id } = req.params;
      const { name, description, statusId, executorId } = req.body.data;

      const taskData = {
        name,
        description,
        statusId: Number(statusId),
        executorId: Number(executorId),
        creatorId: req.user.id,
      };

      try {
        const task = await app.objection.models.task.fromJson(taskData);
        const dbTask = await app.objection.models.task.query().findById(id);
        await dbTask.$query().patch(task);

        req.flash('info', 'task updated succes');
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        console.log('---- patch task err -', err);
        // const task = { id, ...taskData };

        req.flash('error', 'task update error');
        // reply.render('/tasks/edit', { task, errors: err.data });
        req.errr = '123456';
        reply.redirect(`/tasks/${id}/edit`);
        return reply;
      }
    })

    .delete('/tasks/:id', { name: 'deleteTask' }, async (req, reply) => {
      // console.log('- delete req.params -', req.params);
      const { id } = req.params;

      try {
        await app.objection.models.task.query().deleteById(id);

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
