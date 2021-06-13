exports.up = (knex) =>
  knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.integer('status_id');
    table.integer('creator_id');
    table.integer('executor_id');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable('tasks');
