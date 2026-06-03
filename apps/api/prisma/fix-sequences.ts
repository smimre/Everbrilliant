/**
 * Fix PostgreSQL auto-increment sequences that fell out of sync after seeding
 * with explicit integer IDs. Run once after seeding:
 *   npx ts-node prisma/fix-sequences.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEQUENCES: [string, string][] = [
  ['users',              'users_id_seq'],
  ['companies',         'companies_id_seq'],
  ['sessions',          'sessions_id_seq'],
  ['roles',             'roles_id_seq'],
  ['permissions',       'permissions_id_seq'],
  ['accounts',          'accounts_id_seq'],
  ['audit_logs',        'audit_logs_id_seq'],
  ['bank_transactions', 'bank_transactions_id_seq'],
  ['journal_lines',     'journal_lines_id_seq'],
  ['company_connections','company_connections_id_seq'],
  ['invoice_items',     'invoice_items_id_seq'],
  ['tender_products',   'tender_products_id_seq'],
];

async function main() {
  console.log('Fixing PostgreSQL sequences…');
  for (const [table, seq] of SEQUENCES) {
    const sql = `SELECT setval('${seq}', GREATEST(COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, 1))`;
    const rows = await prisma.$queryRawUnsafe<[{ setval: bigint }]>(sql)
      .catch((e: Error) => { console.warn(`  skip ${seq}: ${e.message.split('\n')[0]}`); return null; });
    if (rows) console.log(`  ${seq} → ${rows[0].setval}`);
  }
  console.log('Done.');
}

main().finally(() => prisma.$disconnect());
