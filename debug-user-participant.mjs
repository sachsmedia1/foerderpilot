import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

const email = 's.sachs+kompass@sachs-media.com';

console.log(`\n🔍 Analyzing user: ${email}\n`);

// Find user
const users = await db.select().from(schema.users).where(eq(schema.users.email, email));

if (users.length === 0) {
  console.log('❌ User not found!');
  process.exit(1);
}

const user = users[0];
console.log('✅ User found:');
console.log(`   ID: ${user.id}`);
console.log(`   Email: ${user.email}`);
console.log(`   Name: ${user.name}`);
console.log(`   Role: ${user.role}`);
console.log(`   TenantID: ${user.tenantId}`);

// Find participant
const participants = await db.select().from(schema.participants).where(eq(schema.participants.userId, user.id));

console.log(`\n👤 Participant records: ${participants.length}`);

if (participants.length === 0) {
  console.log('❌ No participant record found!');
  console.log('\n📝 Creating participant record...');
  
  // Create participant
  const [newParticipant] = await db.insert(schema.participants).values({
    tenantId: user.tenantId,
    userId: user.id,
    firstName: user.name?.split(' ')[0] || 'Stefan',
    lastName: user.name?.split(' ').slice(1).join(' ') || 'Sachs',
    email: user.email,
    phone: null,
    street: null,
    zipCode: null,
    city: null,
    dateOfBirth: null,
    placeOfBirth: null,
    nationality: 'Deutsch',
    courseId: null,
    registrationStatus: 'registered',
    registeredAt: new Date(),
  });
  
  console.log(`✅ Participant created with ID: ${newParticipant.insertId}`);
} else {
  const participant = participants[0];
  console.log('✅ Participant found:');
  console.log(`   ID: ${participant.id}`);
  console.log(`   Name: ${participant.firstName} ${participant.lastName}`);
  console.log(`   Email: ${participant.email}`);
  console.log(`   TenantID: ${participant.tenantId}`);
  console.log(`   CourseID: ${participant.courseId}`);
  console.log(`   Status: ${participant.registrationStatus}`);
}

await connection.end();
console.log('\n✅ Done!\n');
