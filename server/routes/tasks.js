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

    .get('/tasks/new', { name: 'newTask' }, async (req, reply) => {
      // console.log('- get /statuses/new req -', req);

      const executors = await app.objection.models.user.query();
      const statuses = await app.objection.models.status.query();

      console.log(1, '- get /tasks/new executors -', executors);
      console.log(2, '- get /tasks/new statuses -', statuses);

      reply.render('tasks/new', { executors, statuses });
      return reply;
    })

    .get('/tasks/:id', { name: 'task' }, async (req, reply) => {
      // console.log('- get /task req -', req);
      try {
        const { id } = req.params;
        const task = await app.objection.models.task.query().findById(id);
        console.log('-- task --', task);

        const { creatorId, executorId, statusId } = task;
        const creator = await app.objection.models.user.query().findById(creatorId);
        const executor = executorId
          ? await app.objection.models.user.query().findById(executorId)
          : '';
        const status = await app.objection.models.status.query().findById(statusId);

        const taskData = {
          id: task.id,
          name: task.name,
          description: task.description,
          creator: creator.fullName(),
          executor: executor ? executor.fullName() : '',
          status: status.name,
          createdAt: task.createdAt,
        };

        console.log('----- taskData ------', taskData);

        reply.render('tasks/one', { task: taskData });
        return reply;
      } catch (err) {
        console.log('-- err --', err);
        return reply;
      }
    })

    .post('/tasks', async (req, reply) => {
      try {
        console.log('---- req.body.data', req.body.data);
        console.log('---- req.user', req.user);

        const { name, description, statusId, executorId } = req.body.data;

        const taskData = {
          name,
          description,
          statusId: Number(statusId),
          executorId: Number(executorId),
          creatorId: req.user.id,
        };

        const task = await app.objection.models.task.fromJson(taskData);
        await app.objection.models.task.query().insert(task);

        console.log(111111, task);

        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        console.log('- task create err -', err);
        const { data } = err;
        console.log('err.data', data);
        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', { task: req.body.data, errors: data });
        return reply;
      }
    })

    .get('/tasks/:id/edit', { name: 'editTask' }, async (req, reply) => {
      // console.log('- get edit user req.user -', req.user);
      // console.log('- get edit status req.params -', req.params);

      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id);
      // console.log('-- task --', task);

      const executors = await app.objection.models.user.query();
      const statuses = await app.objection.models.status.query();

      reply.render('tasks/edit', { task, executors, statuses });
      return reply;
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
        const task = { id, ...taskData };

        req.flash('error', 'task update error');
        reply.render('/tasks/edit', { task, errors: err.data });
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
