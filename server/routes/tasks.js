// @ts-check
// import fastifyPassport from 'fastify-passport';
import i18next from 'i18next';
// import _ from 'lodash';

export default (app) => {
  app

    .get('/tasks', { name: 'tasks', preValidation: app.authenticate }, async (req, reply) => {
      // console.log('- get tasks req -', req);
      // console.log('- get tasks req.query -', req.query);
      const { user, query } = req;

      try {
        const tasks = await app.repositories.task.findAll(query, user);
        const executors = await app.repositories.user.findAll();
        const statuses = await app.repositories.status.findAll();
        const labels = await app.repositories.label.findAll();

        reply.render('tasks/index', { filter: query, tasks, executors, statuses, labels });
        return reply;
      } catch (err) {
        // console.log('- catch get tasks err -', err);
        req.flash('error', i18next.t('flash.serverError'));
        reply.redirect(app.reverse('root'));
        return reply;
      }
    })

    .get('/tasks/:id', { name: 'task', preValidation: app.authenticate }, async (req, reply) => {
      // console.log('- get tasks/:id req -', req);
      const { id } = req.params;

      try {
        const task = await app.repositories.task.findById(id);
        reply.render('tasks/one', { task });
        return reply;
      } catch (err) {
        // console.log('- get task err -', err);
        req.flash('error', i18next.t('flash.serverError'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
    })

    .get('/tasks/new', { name: 'newTask' }, async (req, reply) => {
      // console.log('- get /tasks/new req', req);

      try {
        const executors = await app.repositories.user.findAll();
        const statuses = await app.repositories.status.findAll();
        const labels = await app.repositories.label.findAll();

        reply.render('tasks/new', { task: {}, errors: {}, executors, statuses, labels });
        return reply;
      } catch (err) {
        // console.log('- get task/new err -', err);
        req.flash('error', i18next.t('flash.serverError'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
    })

    .post('/tasks', async (req, reply) => {
      // console.log('- post task req.body.data', req.body.data);
      const { body, user } = req;

      try {
        await app.repositories.task.createOne(body.data, user);
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        // console.log('- post tasks err -', err);

        const executors = await app.repositories.user.findAll();
        const statuses = await app.repositories.status.findAll();
        const labels = await app.repositories.label.findAll();

        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', {
          task: body.data,
          errors: err.data,
          executors,
          statuses,
          labels,
        });
        return reply;
      }
    })

    .get('/tasks/:id/edit', { name: 'editTask' }, async (req, reply) => {
      // console.log('- get task/:id/edit req.params -', req.params);
      const { id } = req.params;

      try {
        const task = await app.repositories.task.findById(id);

        const executors = await app.repositories.user.findAll();
        const statuses = await app.repositories.status.findAll();
        const labels = await app.repositories.label.findAll();

        reply.render('tasks/edit', { task, errors: {}, executors, statuses, labels });
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
      const { data } = req.body;
      const { user } = req;

      try {
        await app.repositories.task.patchById(id, data, user);
        req.flash('info', i18next.t('flash.tasks.update.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        // console.log('- patch task err -', err);

        const executors = await app.repositories.user.findAll();
        const statuses = await app.repositories.status.findAll();
        const labels = await app.repositories.label.findAll();

        const taskLabels = labels.filter((i) => data.labels && data.labels.includes(i.id));
        const task = { id, ...data, labels: taskLabels };

        // console.log('task', task);

        req.flash('error', i18next.t('flash.tasks.update.error'));
        reply.render('/tasks/edit', {
          task,
          errors: err.data,
          executors,
          statuses,
          labels,
        });
        return reply;
      }
    })

    .delete('/tasks/:id', { name: 'deleteTask' }, async (req, reply) => {
      // console.log('- delete task req.params -', req.params);
      // const { models } = app.objection;
      const { id } = req.params;
      const userId = req.user.id;

      try {
        const { creatorId } = await app.repositories.task.findById(id);

        if (userId !== creatorId) {
          req.flash('error', 'task delete creator error');
          reply.redirect(app.reverse('tasks'));
          return reply;
        }

        await app.repositories.task.deleteById(id);
        req.flash('info', i18next.t('flash.tasks.delete.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        // console.log('- delete task catch err -', err);
        req.flash('error', i18next.t('flash.tasks.delete.error'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
    });
};
