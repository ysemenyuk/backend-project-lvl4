// @ts-check
// import fastifyPassport from 'fastify-passport';
import i18next from 'i18next';
import _ from 'lodash';

export default (app) => {
  app

    .get('/tasks', { name: 'tasks', preValidation: app.authenticate }, async (req, reply) => {
      try {
        const tasks = await app.objection.models.task
          .query()
          .withGraphJoined('[status, creator, executor]');

        // console.log('- get tasks tasks -', tasks);

        reply.render('tasks/index', { tasks });
        return reply;
      } catch (err) {
        // console.log('- catch get tasks err -', err);

        req.flash('error', 'server error');
        reply.redirect(app.reverse('root'));
        return reply;
      }
    })

    .get('/tasks/:id', { name: 'task', preValidation: app.authenticate }, async (req, reply) => {
      // console.log('- get task req -', req);
      const { id } = req.params;

      try {
        const task = await app.objection.models.task
          .query()
          .findById(id)
          .withGraphJoined('[status, creator, executor]');

        // console.log('- get task task -', task);

        reply.render('tasks/one', { task });
        return reply;
      } catch (err) {
        // console.log('- get task err -', err);

        req.flash('error', 'server error');
        reply.redirect(app.reverse('tasks'));
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
        // console.log('- get task/new err -', err);

        req.flash('error', 'server error');
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
    })

    .post('/tasks', async (req, reply) => {
      // console.log('---post tasks req.body.data---', req.body.data);

      const { name, description, statusId, executorId } = req.body.data;

      const formData = {
        name,
        description,
        statusId: statusId ? Number(statusId) : null,
        executorId: executorId ? Number(executorId) : null,
        creatorId: req.user.id,
      };

      // console.log('- post tasks formData -', formData);

      const taskData = _.omitBy(formData, _.isNull);
      // console.log('- post tasks taskData -', taskData);

      let task;
      let executors;
      let statuses;

      try {
        executors = await app.objection.models.user.query();
        statuses = await app.objection.models.status.query();
        task = await app.objection.models.task.fromJson(taskData);

        await app.objection.models.task.query().insert(task);

        // console.log('- post tasks task -', task);

        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        // console.log('- post tasks err -', err);
        // console.log('- post tasks err.data -', err.data);

        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', { task: formData, errors: err.data, executors, statuses });
        return reply;
      }
    })

    .get('/tasks/:id/edit', { name: 'editTask' }, async (req, reply) => {
      // console.log('- get task/:id/edit req.params -', req.params);
      const { id } = req.params;

      try {
        const task = await app.objection.models.task.query().findById(id);
        console.log('- get task/:id/edit task -', task);

        const executors = await app.objection.models.user.query();
        const statuses = await app.objection.models.status.query();

        reply.render('tasks/edit', { task, errors: {}, executors, statuses });
        return reply;
      } catch (err) {
        // console.log('- get task/:id/edit catch err -', err);

        req.flash('error', 'server error');
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
    })

    .patch('/tasks/:id', { name: 'patchTask' }, async (req, reply) => {
      // console.log('- patch task req.params -', req.params);
      // console.log('- patch task req.body.data', req.body.data);

      const { id } = req.params;
      const { name, description, statusId, executorId } = req.body.data;

      const formData = {
        name,
        description,
        statusId: statusId ? Number(statusId) : null,
        executorId: executorId ? Number(executorId) : null,
        creatorId: req.user.id,
      };

      console.log('- post tasks formData -', formData);

      const taskData = _.omitBy(formData, _.isNull);
      // console.log('- post tasks taskData -', taskData);

      let formTask;
      let executors;
      let statuses;

      try {
        executors = await app.objection.models.user.query();
        statuses = await app.objection.models.status.query();

        formTask = await app.objection.models.task.fromJson(taskData);

        const dbTask = await app.objection.models.task.query().findById(id);
        await dbTask.$query().patch(formTask);

        req.flash('info', 'task updated succes');
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        // console.log('- patch task err -', err);
        const task = { id, ...formData };

        req.flash('error', 'task update error');
        reply.render('/tasks/edit', { task, errors: err.data, executors, statuses });
        return reply;
      }
    })

    .delete('/tasks/:id', { name: 'deleteTask' }, async (req, reply) => {
      // console.log('- delete task req.params -', req.params);
      const { id } = req.params;

      try {
        await app.objection.models.task.query().deleteById(id);

        req.flash('info', 'task deleted succes');
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        console.log('- delete task catch err -', err);

        req.flash('error', 'task delete error');
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
    });
};
