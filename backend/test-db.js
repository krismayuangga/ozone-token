const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  console.log('📊 Database config:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER
  });

  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Database connected successfully!');

    // Test queries
    console.log('\n🔍 Testing database structure...');

    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables found:', tables.map(t => Object.values(t)[0]));

    // Check users
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log('👥 Users count:', users[0].count);

    // Check stakes
    const [stakes] = await connection.execute('SELECT COUNT(*) as count FROM stakes');
    console.log('💰 Stakes count:', stakes[0].count);

    // Check active stakes
    const [activeStakes] = await connection.execute('SELECT COUNT(*) as count FROM stakes WHERE is_active = TRUE');
    console.log('🔥 Active stakes:', activeStakes[0].count);

    // Show sample user data
    const [sampleUsers] = await connection.execute('SELECT wallet_address, username, is_admin, total_staked FROM users LIMIT 3');
    console.log('\n👤 Sample users:');
    sampleUsers.forEach(user => {
      console.log(`  • ${user.username || 'No name'} (${user.wallet_address.substring(0, 10)}...) - Admin: ${user.is_admin} - Staked: ${user.total_staked}`);
    });

    // Show sample stakes
    const [sampleStakes] = await connection.execute('SELECT wallet_address, amount, is_active, created_at FROM stakes ORDER BY created_at DESC LIMIT 3');
    console.log('\n💎 Sample stakes:');
    sampleStakes.forEach(stake => {
      console.log(`  • ${stake.wallet_address.substring(0, 10)}... - ${stake.amount} OZONE - Active: ${stake.is_active} - ${stake.created_at}`);
    });

    await connection.end();
    console.log('\n🎉 Database test completed successfully!');
    console.log('\n🚀 Ready to start backend server!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure XAMPP is running');
    console.log('2. Check MySQL service is started');
    console.log('3. Verify database name exists: ozone_staking');
    console.log('4. Check credentials in .env file');
    console.log('5. Import setup_local.sql in PHPMyAdmin');
  }
}

testDatabaseConnection();
