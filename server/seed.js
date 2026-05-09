const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const seedData = async () => {
  try {
    const uri = process.env.MONGODB_URI && String(process.env.MONGODB_URI).trim();
    if (!uri) {
      console.error('❌ MONGODB_URI is not set in server/.env or the environment');
      process.exit(1);
    }
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ─── Create Users ──────────────────────────────────────
    const admin = await User.create({
      name: 'Sarah Admin',
      email: 'admin@taskflow.com',
      password: 'admin123',
      role: 'admin',
    });

    const member1 = await User.create({
      name: 'John Member',
      email: 'john@taskflow.com',
      password: 'member123',
      role: 'member',
    });

    const member2 = await User.create({
      name: 'Emily Developer',
      email: 'emily@taskflow.com',
      password: 'member123',
      role: 'member',
    });

    const member3 = await User.create({
      name: 'Mike Designer',
      email: 'mike@taskflow.com',
      password: 'member123',
      role: 'member',
    });

    console.log('👤 Created 4 users');

    // ─── Create Projects ───────────────────────────────────
    const project1 = await Project.create({
      title: 'E-Commerce Platform',
      description:
        'Building a modern e-commerce platform with React and Node.js. Features include product catalog, shopping cart, payment integration, and order management.',
      createdBy: admin._id,
      members: [admin._id, member1._id, member2._id],
      color: '#6366f1',
    });

    const project2 = await Project.create({
      title: 'Mobile Banking App',
      description:
        'Designing and developing a secure mobile banking application with real-time transaction tracking, biometric auth, and investment portfolio management.',
      createdBy: admin._id,
      members: [admin._id, member2._id, member3._id],
      color: '#8b5cf6',
    });

    const project3 = await Project.create({
      title: 'Healthcare Dashboard',
      description:
        'Creating an analytics dashboard for healthcare providers to monitor patient data, appointment scheduling, and resource allocation.',
      createdBy: admin._id,
      members: [admin._id, member1._id, member3._id],
      color: '#06b6d4',
    });

    console.log('📁 Created 3 projects');

    // ─── Create Tasks ──────────────────────────────────────
    const now = new Date();
    const daysFromNow = (days) => new Date(now.getTime() + days * 86400000);
    const daysAgo = (days) => new Date(now.getTime() - days * 86400000);

    const tasks = await Task.insertMany([
      // Project 1: E-Commerce Platform
      {
        title: 'Design product listing page',
        description: 'Create wireframes and high-fidelity mockups for the product listing page with filters and sorting.',
        status: 'done',
        priority: 'high',
        assignedTo: member3._id,
        projectId: project1._id,
        dueDate: daysAgo(2),
        order: 0,
      },
      {
        title: 'Implement shopping cart API',
        description: 'Build RESTful API endpoints for cart operations: add, remove, update quantity, and checkout.',
        status: 'in-progress',
        priority: 'high',
        assignedTo: member1._id,
        projectId: project1._id,
        dueDate: daysFromNow(3),
        order: 0,
      },
      {
        title: 'Set up payment gateway integration',
        description: 'Integrate Stripe payment gateway for handling credit card and digital wallet payments.',
        status: 'todo',
        priority: 'high',
        assignedTo: member2._id,
        projectId: project1._id,
        dueDate: daysFromNow(7),
        order: 0,
      },
      {
        title: 'Create product search functionality',
        description: 'Implement full-text search with autocomplete suggestions and category filtering.',
        status: 'in-progress',
        priority: 'medium',
        assignedTo: member2._id,
        projectId: project1._id,
        dueDate: daysFromNow(5),
        order: 1,
      },
      {
        title: 'Write unit tests for cart module',
        description: 'Create comprehensive unit tests for the shopping cart service layer.',
        status: 'todo',
        priority: 'low',
        assignedTo: member1._id,
        projectId: project1._id,
        dueDate: daysFromNow(10),
        order: 1,
      },

      // Project 2: Mobile Banking App
      {
        title: 'Design authentication flow',
        description: 'Create UX flow for login, signup, biometric auth, and password recovery screens.',
        status: 'done',
        priority: 'high',
        assignedTo: member3._id,
        projectId: project2._id,
        dueDate: daysAgo(5),
        order: 0,
      },
      {
        title: 'Implement transaction history API',
        description: 'Build API to fetch, filter, and paginate user transaction history with date range support.',
        status: 'done',
        priority: 'high',
        assignedTo: member2._id,
        projectId: project2._id,
        dueDate: daysAgo(1),
        order: 1,
      },
      {
        title: 'Build real-time balance updates',
        description: 'Implement WebSocket-based real-time balance and transaction notifications.',
        status: 'in-progress',
        priority: 'high',
        assignedTo: member2._id,
        projectId: project2._id,
        dueDate: daysFromNow(2),
        order: 0,
      },
      {
        title: 'Create investment portfolio view',
        description: 'Design and build the portfolio overview with charts showing asset allocation and performance.',
        status: 'todo',
        priority: 'medium',
        assignedTo: member3._id,
        projectId: project2._id,
        dueDate: daysFromNow(8),
        order: 0,
      },
      {
        title: 'Security audit preparation',
        description: 'Prepare documentation and test cases for the upcoming security audit. Review OWASP guidelines.',
        status: 'todo',
        priority: 'high',
        assignedTo: member2._id,
        projectId: project2._id,
        dueDate: daysAgo(1), // Overdue!
        order: 1,
      },

      // Project 3: Healthcare Dashboard
      {
        title: 'Design dashboard wireframes',
        description: 'Create wireframes for the main analytics dashboard with key metrics and chart layouts.',
        status: 'done',
        priority: 'high',
        assignedTo: member3._id,
        projectId: project3._id,
        dueDate: daysAgo(7),
        order: 0,
      },
      {
        title: 'Implement patient data API',
        description: 'Build secure API endpoints for patient data retrieval with HIPAA-compliant data handling.',
        status: 'done',
        priority: 'high',
        assignedTo: member1._id,
        projectId: project3._id,
        dueDate: daysAgo(3),
        order: 1,
      },
      {
        title: 'Build appointment calendar component',
        description: 'Create an interactive calendar component for viewing and managing patient appointments.',
        status: 'in-progress',
        priority: 'medium',
        assignedTo: member1._id,
        projectId: project3._id,
        dueDate: daysFromNow(4),
        order: 0,
      },
      {
        title: 'Create analytics charts',
        description: 'Implement interactive charts for patient demographics, visit trends, and resource utilization.',
        status: 'todo',
        priority: 'medium',
        assignedTo: member3._id,
        projectId: project3._id,
        dueDate: daysFromNow(6),
        order: 0,
      },
      {
        title: 'Set up data export functionality',
        description: 'Allow admins to export dashboard data in CSV and PDF formats.',
        status: 'todo',
        priority: 'low',
        assignedTo: member1._id,
        projectId: project3._id,
        dueDate: daysFromNow(14),
        order: 1,
      },
    ]);

    console.log(`✅ Created ${tasks.length} tasks`);

    console.log('\n══════════════════════════════════════');
    console.log('  🌱 Seed data created successfully!');
    console.log('══════════════════════════════════════');
    console.log('\n📧 Test Accounts:');
    console.log('  Admin:  admin@taskflow.com / admin123');
    console.log('  Member: john@taskflow.com  / member123');
    console.log('  Member: emily@taskflow.com / member123');
    console.log('  Member: mike@taskflow.com  / member123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
