// @ts-check

import i18next from 'i18next';

export default (app) => {
  app

    .get('/tasks', { name: 'tasks', preValidation: app.authenticate }, async (req, reply) => {
      const { user, query } = req;

      try {
        const tasks = await app.repositories.task.findAll(query, user);
        const executors = await app.repositories.user.findAll();
        const statuses = await app.repositories.status.findAll();
        const labels = await app.repositories.label.findAll();

        reply.render('tasks/index', {
          filter: query,
          tasks,
          executors,
          statuses,
          labels,
        });
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.serverError'));
        reply.redirect(app.reverse('root'));
        return reply;
      }
    })

    .get('/tasks/:id', { name: 'task', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;

      try {
        const task = await app.repositories.task.findById(id);
        reply.render('tasks/one', { task });
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.serverError'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
    })

    .get('/tasks/new', { name: 'newTask', preValidation: app.authenticate }, async (req, reply) => {
      try {
        const task = new app.objection.models.task();
        const errors = {};
        const executors = await app.repositories.user.findAll();
        const statuses = await app.repositories.status.findAll();
        const labels = await app.repositories.label.findAll();

        reply.render('tasks/new', {
          task,
          errors,
          executors,
          statuses,
          labels,
        });
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.serverError'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
    })

    .get('/tasks/:id/edit', { name: 'editTask', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;

      try {
        const task = await app.repositories.task.findById(id);

        const executors = await app.repositories.user.findAll();
        const statuses = await app.repositories.status.findAll();
        const labels = await app.repositories.label.findAll();

        reply.render('tasks/edit', {
          task,
          errors: {},
          executors,
          statuses,
          labels,
        });
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.serverError'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
    })

    .post('/tasks', async (req, reply) => {
      const { body, user } = req;

      try {
        await app.repositories.task.createOne(body.data, user);
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
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

    .patch('/tasks/:id', { name: 'patchTask', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const { data } = req.body;
      const { user } = req;

      try {
        await app.repositories.task.patchById(id, data, user);
        req.flash('info', i18next.t('flash.tasks.update.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        const executors = await app.repositories.user.findAll();
        const statuses = await app.repositories.status.findAll();
        const labels = await app.repositories.label.findAll();

        const taskLabels = labels.filter((i) => data.labels && data.labels.includes(i.id));
        const task = { id, ...data, labels: taskLabels };

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

    .delete('/tasks/:id', { name: 'deleteTask', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const userId = req.user.id;

      try {
        const { creatorId } = await app.repositories.task.findById(id);

        if (userId !== creatorId) {
          req.flash('error', i18next.t('flash.tasks.delete.creatorError'));
          reply.redirect(app.reverse('tasks'));
          return reply;
        }

        await app.repositories.task.deleteById(id);
        req.flash('info', i18next.t('flash.tasks.delete.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.tasks.delete.error'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
    });
};
