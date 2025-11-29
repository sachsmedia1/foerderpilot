#!/usr/bin/env node
/**
 * FOERDERPILOT - SEED SCRIPT
 * 
 * Erstellt Test-Daten für die Entwicklung:
 * - 1 Test-Tenant (Bildungsträger)
 * - 1 Super Admin User
 * - 1 Tenant Admin User
 * - 1 Test-Kurs
 * - 1 Test-Sammeltermin
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { tenants, users, courses, sammeltermins } from '../drizzle/schema.js';

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log('🌱 Starting seed process...\n');

  try {
    // 1. Test-Tenant erstellen
     // 1. Tenant erstellen (app.foerderpilot.io)
  console.log('📦 Creating main app tenant...');
  const [tenant] = await db.insert(tenants).values({
    name: 'FörderPilot App',
    subdomain: 'app',
    companyName: 'FörderPilot GmbH',
    email: 'info@foerderpilot.io',
    phone: '+49 123 456789',
    street: 'Musterstraße 123',
    zipCode: '12345',
    city: 'Berlin',
    primaryColor: '#1E40AF',
    secondaryColor: '#3B82F6',
    isActive: true,
  }).$returningId();
  
  console.log(`✅ Tenant created with ID: ${tenant.id}`);

  // 2. Super Admin User erstellen
  console.log('👤 Creating super admin user...');
  await db.insert(users).values({
    openId: 'super-admin-openid',
    email: 'admin@foerderpilot.io',
    name: 'Super Admin',
    firstName: 'Super',
    lastName: 'Admin',
    loginMethod: 'manus',
    role: 'super_admin',
    tenantId: null, // Super Admin gehört zu keinem Tenant
    isActive: true,
  });
  
  console.log('✅ Super admin created: admin@foerderpilot.io');

  // 3. Tenant Admin User erstellen
  console.log('👤 Creating tenant admin user...');
  await db.insert(users).values({
    openId: 'tenant-admin-openid',
    email: 'admin@app.foerderpilot.io',
    name: 'App Admin',
    firstName: 'App',
    lastName: 'Admin',
    loginMethod: 'manus',
    role: 'admin',
    tenantId: tenant.id,
    isActive: true,
  });
  
  console.log('✅ Tenant admin created: admin@app.foerderpilot.io\n');

  // 4. Test-Kurs erstellen
  console.log('📚 Creating test course...');
  const [course] = await db.insert(courses).values({
    tenantId: tenant.id,
    name: 'Digitales Marketing & Social Media',
    shortDescription: 'Lernen Sie die Grundlagen des digitalen Marketings und Social Media Managements.',
    detailedDescription: 'Dieser Kurs vermittelt umfassende Kenntnisse im Bereich digitales Marketing, Social Media Management und Content-Erstellung. Perfekt für Quereinsteiger und Wiedereinsteiger in den Arbeitsmarkt.',
    topics: JSON.stringify(['Social Media', 'Content Marketing', 'SEO', 'Google Ads', 'Facebook Ads']),
    duration: 240, // 240 Stunden
    scheduleType: 'weeks',
    scheduleDetails: JSON.stringify({
      weeks: 6,
      sessionsPerWeek: 5,
      hoursPerSession: 8,
    }),
    priceNet: 500000, // 5000 EUR in Cent
    priceGross: 595000, // 5950 EUR in Cent
    subsidyPercentage: 90,
    trainerNames: 'Sarah Schmidt, Michael Weber',
    trainerQualifications: 'Zertifizierte Digital Marketing Experten mit 10+ Jahren Erfahrung',
    isActive: true,
    isPublished: true,
    maxParticipants: 15,
  }).$returningId();
  
  console.log(`✅ Course created with ID: ${course.id}\n`);

  // 5. Test-Sammeltermin erstellen
  console.log('📅 Creating test sammeltermin...');
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const submissionDeadline = new Date(nextWeek);
  submissionDeadline.setDate(submissionDeadline.getDate() - 1);
  
  const [sammeltermin] = await db.insert(sammeltermins).values({
    tenantId: tenant.id,
    courseId: course.id,
    date: nextWeek,
    submissionDeadline: submissionDeadline,
    zoomLink: 'https://zoom.us/j/123456789',
    kompassReviewerEmail: 'reviewer@kompass.de',
    status: 'scheduled',
    notes: 'Erster Test-Sammeltermin für Demo-Zwecke',
  }).$returningId();
  
  console.log('✅ Sammeltermin created\n');

  console.log('🎉 Seed process completed successfully!');
  console.log('📝 Summary:');
  console.log('   - Tenant: app.foerderpilot.io');
  console.log('   - Super Admin: admin@foerderpilot.io');
  console.log('   - Tenant Admin: admin@app.foerderpilot.io');
  console.log('   - Course: Digitales Marketing & Social Media');
  console.log(`   - Sammeltermin: ${nextWeek.toLocaleDateString('de-DE')}`);
  console.log('');
  console.log('🌐 URLs:');
  console.log('   - Main App: https://app.foerderpilot.io');
  console.log('   - Maintenance: https://foerderpilot.io');
  console.log('   - Super Admin: https://app.foerderpilot.io/superadmin');
  
  process.exit(0);
  } catch (error) {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  }
}

seed();
