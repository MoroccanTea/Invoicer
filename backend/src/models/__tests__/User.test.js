const mongoose = require('mongoose');
const User = require('../User');
const bcrypt = require('bcryptjs');

describe('User Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, { useNewUrlParser: true, useCreateIndex: true });
  });

  it('create & save user successfully', async () => {
    const userData = { 
      name: 'testuser', 
      email: 'test@example.com', 
      password: 'password123' 
    };
    const validUser = new User(userData);
    const savedUser = await validUser.save();
    
    // Object Id should be defined when successfully saved to MongoDB.
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    // Password should be hashed
    expect(savedUser.password).not.toBe(userData.password);
    expect(savedUser.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/); // bcrypt hash pattern
  });

  it('should hash password before saving', async () => {
    const user = new User({
      name: 'test',
      email: 'test2@example.com',
      password: 'mypassword'
    });
    await user.save();
    expect(user.password).not.toBe('mypassword');
    const isMatch = await bcrypt.compare('mypassword', user.password);
    expect(isMatch).toBe(true);
  });

  it('should generate unique hashes for same password', async () => {
    const password = 'samepassword123';
    const user1 = new User({
      name: 'user1',
      email: 'user1@example.com',
      password
    });
    const user2 = new User({
      name: 'user2',
      email: 'user2@example.com',
      password
    });
    await user1.save();
    await user2.save();
    expect(user1.password).not.toBe(user2.password);
  });

  it('comparePassword should validate correct password', async () => {
    const password = 'testpass123';
    const user = new User({
      name: 'test',
      email: 'test3@example.com',
      password
    });
    await user.save();
    const isMatch = await user.comparePassword(password);
    expect(isMatch).toBe(true);
  });

  it('comparePassword should reject wrong password', async () => {
    const user = new User({
      name: 'test',
      email: 'test4@example.com',
      password: 'correctpass'
    });
    await user.save();
    const isMatch = await user.comparePassword('wrongpass');
    expect(isMatch).toBe(false);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
