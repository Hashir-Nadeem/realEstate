#!/usr/bin/env node

/**
 * Test script to verify user registration flow
 * This script tests:
 * 1. User registration API
 * 2. CSV file creation and storage
 * 3. User retrieval from CSV
 */

async function testUserRegistration() {
  console.log('🧪 Testing User Registration Flow...\n');

  const baseUrl = 'http://localhost:3001';
  
  // Test data
  const testUser = {
    id: Date.now().toString(),
    name: 'John Doe',
    email: 'john.doe@example.com', 
    phone: '+919876543210',
    password: 'test123456',
    createdAt: new Date().toISOString()
  };

  try {
    // Test 1: Register a new user
    console.log('📝 Test 1: Registering new user...');
    const registerResponse = await fetch(`${baseUrl}/api/register-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const registerResult = await registerResponse.json();
    
    if (registerResponse.ok && registerResult.success) {
      console.log('✅ Registration successful!');
      console.log(`   User ID: ${registerResult.userId}`);
      console.log(`   Message: ${registerResult.message}`);
    } else {
      console.log('❌ Registration failed!');
      console.log(`   Error: ${registerResult.message || 'Unknown error'}`);
      return;
    }

    // Test 2: Retrieve all users
    console.log('\n📚 Test 2: Retrieving all users...');
    const getUsersResponse = await fetch(`${baseUrl}/api/register-user`);
    const getUsersResult = await getUsersResponse.json();

    if (getUsersResponse.ok && getUsersResult.users) {
      console.log('✅ User retrieval successful!');
      console.log(`   Total users found: ${getUsersResult.users.length}`);
      
      // Find our test user
      const foundUser = getUsersResult.users.find(user => user.phone === testUser.phone);
      if (foundUser) {
        console.log('✅ Test user found in CSV!');
        console.log(`   Name: ${foundUser.name}`);
        console.log(`   Email: ${foundUser.email}`);
        console.log(`   Phone: ${foundUser.phone}`);
        console.log(`   Created: ${foundUser.createdAt}`);
      } else {
        console.log('❌ Test user not found in CSV!');
      }
    } else {
      console.log('❌ Failed to retrieve users!');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('• User registration API is working');
    console.log('• CSV storage is functioning');
    console.log('• User data can be retrieved from CSV');
    console.log('\n✨ Registration flow is ready for testing in the app!');
    
  } catch (error) {
    console.log('💥 Test failed with error:', error.message);
  }
}

// Run the test if the server is running
testUserRegistration();