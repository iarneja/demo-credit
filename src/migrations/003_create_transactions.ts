import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.integer('wallet_id').unsigned().notNullable();
    table.enum('type', ['fund', 'transfer', 'withdraw']).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.integer('related_wallet_id').unsigned().nullable();
    table.enum('status', ['success', 'failed']).defaultTo('success');
    table.timestamps(true, true);
    table.foreign('wallet_id').references('id').inTable('wallets').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('transactions');
}