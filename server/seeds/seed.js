/**
 * Admin Seed Script
 * 
 * Seeds the database with a default admin user.
 * Admin accounts cannot be created through public registration.
 * 
 * Usage: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@digitalmicrosys.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const adminName = process.env.ADMIN_NAME || 'System Admin';

    // Check if admin already exists
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log(`⚠️  Admin already exists: ${adminEmail}`);
      console.log(`   Role: ${existing.role}`);
      console.log(`   Active: ${existing.isActive}`);
      process.exit(0);
    }

    // Create admin (no rollNumber needed for admin role)
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      rollNumber: undefined, // Not required for admin
      isActive: true,
    });

    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║  ✅  Admin account created successfully!         ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  📧  Email:    ${adminEmail.padEnd(34)}║`);
    console.log(`║  🔑  Password: ${adminPassword.padEnd(34)}║`);
    console.log(`║  👤  Name:     ${adminName.padEnd(34)}║`);
    console.log('╠══════════════════════════════════════════════════╣');
    console.log('║  ⚠️  Change the password after first login!      ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌  Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
