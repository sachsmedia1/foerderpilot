import { drizzle } from 'drizzle-orm/mysql2';
import { tenants } from '../drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);
const result = await db.select().from(tenants);
console.log('Tenants in database:');
console.log(JSON.stringify(result, null, 2));
process.exit(0);
