exports.up = (knex) => knex.schema.createTable('tasks_labels', (table) => {
  table.integer('task_id');
  table.integer('label_id');
});

exports.down = (knex) => knex.schema.dropTable('tasks_labels');
