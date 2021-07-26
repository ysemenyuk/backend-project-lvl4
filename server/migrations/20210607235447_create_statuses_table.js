exports.up = (knex) => knex.schema.createTable('statuses', (table) => {
  table.increments('id').primary();
  table.string('name');
  table.timestamp('created_at').defaultTo(knex.fn.now());
  table.timestamp('updated_at').defaultTo(knex.fn.now());
  // table.foreign('task_id').references('id').inTable('tasks');
});

exports.down = (knex) => knex.schema.dropTable('statuses');
