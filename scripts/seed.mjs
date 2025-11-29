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
    console.log('📦 Creating test tenant...');
    const [tenant] = await db.insert(tenants).values({
      name: 'Bildungsträger Demo GmbH',
      subdomain: 'demo',
      companyName: 'Bildungsträger Demo GmbH',
      email: 'info@demo-bildungstraeger.de',
      phone: '+49 30 12345678',
      street: 'Musterstraße 123',
      zipCode: '10115',
      city: 'Berlin',
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      logoUrl: 'https://via.placeholder.com/300x100.png?text=Demo+Logo',
      certificationType: 'AZAV',
      directorName: 'Max Mustermann',
      isActive: true,
    }).$returningId();
    
    console.log(`✅ Tenant created with ID: ${tenant.id}\n`);

    // 2. Super Admin erstellen
    console.log('👤 Creating super admin user...');
    await db.insert(users).values({
      openId: 'super-admin-demo',
      email: 'admin@foerderpilot.io',
      name: 'Super Admin',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      tenantId: null, // NULL = Super Admin
      isActive: true,
    });
    
    console.log('✅ Super admin created: admin@foerderpilot.io\n');

    // 3. Tenant Admin erstellen
    console.log('👤 Creating tenant admin user...');
    await db.insert(users).values({
      openId: 'tenant-admin-demo',
      email: 'admin@demo-bildungstraeger.de',
      name: 'Demo Admin',
      firstName: 'Demo',
      lastName: 'Admin',
      role: 'admin',
      tenantId: tenant.id,
      isActive: true,
    });
    
    console.log('✅ Tenant admin created: admin@demo-bildungstraeger.de\n');

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
    
    await db.insert(sammeltermins).values({
      tenantId: tenant.id,
      courseId: course.id,
      date: nextWeek,
      submissionDeadline: submissionDeadline,
      zoomLink: 'https://zoom.us/j/123456789',
      kompassReviewerEmail: 'reviewer@kompass.de',
      status: 'scheduled',
      notes: 'Erster Test-Sammeltermin für Demo-Zwecke',
    });
    
    console.log('✅ Sammeltermin created\n');

    console.log('🎉 Seed process completed successfully!\n');
    console.log('📝 Summary:');
    console.log(`   - Tenant: demo.foerderpilot.io`);
    console.log(`   - Super Admin: admin@foerderpilot.io`);
    console.log(`   - Tenant Admin: admin@demo-bildungstraeger.de`);
    console.log(`   - Course: Digitales Marketing & Social Media`);
    console.log(`   - Sammeltermin: ${nextWeek.toLocaleDateString('de-DE')}\n`);

  } catch (error) {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  }
}

seed();
