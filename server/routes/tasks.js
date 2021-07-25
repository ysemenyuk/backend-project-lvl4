// @ts-check
// import fastifyPassport from 'fastify-passport';
import i18next from 'i18next';
import _ from 'lodash';

export default (app) => {
  app

    .get('/tasks', { name: 'tasks', preValidation: app.authenticate }, async (req, reply) => {
      // console.log('- get tasks req -', req);
      // console.log('- get tasks req.query -', req.query);
      // console.log('- get tasks req.params -', req.params);

      const { models, knex } = app.objection;
      const { user } = req;

      const filter = { ...req.query };
      console.log('filter', filter);

      try {
        const tasks = await models.task
          .query()
          .withGraphFetched('[status, creator, executor, labels]')
          .modify('filterStatus', filter.status)
          .modify('filterExecutor', filter.executor)
          .modify('filterLabel', filter.label, knex)
          .modify('filterCreator', filter.isCreatorUser, user.id)
          .orderBy('id');

        const executors = await models.user.query();
        const statuses = await models.status.query();
        const labels = await models.label.query();

        console.log('- get tasks tasks -', tasks);
        reply.render('tasks/index', { filter, tasks, executors, statuses, labels });
        return reply;
      } catch (err) {
        console.log('- catch get tasks err -', err);
        req.flash('error', i18next.t('flash.serverError'));
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
          .withGraphJoined('[status, creator, executor, labels]');

        // console.log('- get task task -', task);

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
      try {
        const executors = await app.objection.models.user.query();
        const statuses = await app.objection.models.status.query();
        const labels = await app.objection.models.label.query();

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

      const { models } = app.objection;
      // const { name, description, statusId, executorId } = req.body.data;
      const formLabels = req.body.data.labels;

      const formData = models.task.prepareData(req.body.data, req.user.id);

      // console.log('- patch tasks formData -', formData);

      let executors;
      let statuses;
      let labels;

      try {
        executors = await models.user.query();
        statuses = await models.status.query();
        labels = await models.label.query();

        const task = await models.task.fromJson(formData);

        await models.task.transaction(async (trx) => {
          await models.task.query(trx).insert(task);
          await task.$relatedQuery('labels', trx).relate(formLabels);
          // console.log('- post tasks task -', task);
        });

        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        // console.log('- post tasks err -', err);
        // console.log('- post tasks err.data -', err.data);
        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', {
          task: req.body.data,
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
        const task = await app.objection.models.task
          .query()
          .findById(id)
          .withGraphJoined('[labels]');

        // console.log('- get task/:id/edit task -', task);

        const executors = await app.objection.models.user.query();
        const statuses = await app.objection.models.status.query();
        const labels = await app.objection.models.label.query();

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
      console.log('- patch task req.params -', req.params);
      console.log('- patch task req.body.data', req.body.data);

      const { models } = app.objection;

      const { id } = req.params;
      const { name, description, statusId, executorId } = req.body.data;
      const formLabels = req.body.data.labels;

      const formData = _.omitBy(
        {
          name,
          description,
          statusId: statusId ? Number(statusId) : null,
          executorId: executorId ? Number(executorId) : null,
          creatorId: req.user.id,
        },
        _.isNull
      );

      // console.log('- patch tasks formData -', formData);

      let executors;
      let statuses;
      let labels;

      try {
        executors = await models.user.query();
        statuses = await models.status.query();
        labels = await models.label.query();

        const formTask = await models.task.fromJson(formData);
        const dbTask = await models.task.query().findById(id);

        await models.task.transaction(async (trx) => {
          await dbTask.$query(trx).patch(formTask);
          await dbTask.$relatedQuery('labels', trx).unrelate();
          await dbTask.$relatedQuery('labels', trx).relate(formLabels);

          // console.log('- patch tasks dbTask -', dbTask);
        });

        req.flash('info', i18next.t('flash.tasks.update.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        console.log('- patch task err -', err);
        const task = {
          id,
          ...formData,
          labels: labels.filter((i) => formLabels.includes(i.id)),
        };
        // console.log('- patch task catch error task -', task);
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
      const { models } = app.objection;
      const { id } = req.params;
      const userId = req.user.id;

      try {
        const { creatorId } = await models.task.query().findById(id);

        if (userId !== creatorId) {
          req.flash('error', 'task delete creator error');
          reply.redirect(app.reverse('tasks'));
          return reply;
        }

        await models.task.transaction(async (trx) => {
          await models.task.relatedQuery('labels', trx).for(id).unrelate();
          await models.task.query(trx).deleteById(id);
          // console.log('- patch tasks dbTask -', dbTask);
        });

        req.flash('info', 'task deleted succes');
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        // console.log('- delete task catch err -', err);
        req.flash('error', 'task delete error');
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
    });
};
