require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Asset = require('./models/Asset');
const Ownership = require('./models/Ownership');
const Transaction = require('./models/Transaction');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Transaction.deleteMany({});
    await Ownership.deleteMany({});
    await User.deleteMany({});
    await Asset.deleteMany({});

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@assetchain.com',
      password: 'admin123',
      role: 'admin',
      walletBalance: 1000000
    });

    // Create test user
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user',
      walletBalance: 100000
    });

    console.log('✅ Users seeded');

    // Create real estate assets
    const assets = await Asset.create([
      {
        name: 'Marina Bay Towers — Unit 42A',
        description: 'Premium residential unit in Marina Bay Towers, a landmark 52-story luxury condominium in the heart of the financial district. Features panoramic ocean views, smart home integration, rooftop infinity pool, and 24/7 concierge service. Currently generating ₹45,000/month rental income with 98% occupancy rate over the past 3 years.',
        category: 'real-estate',
        totalValue: 15000000,
        totalTokens: 15000,
        availableTokens: 15000,
        pricePerToken: 1000,
        location: 'Mumbai, India',
        annualYield: 8.5,
        createdBy: admin._id
      },
      {
        name: 'Sunrise Commercial Complex — Block B',
        description: 'Grade-A commercial office space spanning 25,000 sq.ft across 3 floors in the Sunrise Commercial Complex. Currently leased to 4 multinational tenants with an average lease period of 5 years. Premium amenities include fiber-optic connectivity, backup power, underground parking, and food court access. Located in the IT corridor with excellent metro connectivity.',
        category: 'real-estate',
        totalValue: 25000000,
        totalTokens: 25000,
        availableTokens: 25000,
        pricePerToken: 1000,
        location: 'Hyderabad, India',
        annualYield: 9.8,
        createdBy: admin._id
      },
      {
        name: 'Green Valley Residences — Villa Plot 7',
        description: 'Exclusive 4BHK villa in the gated community of Green Valley Residences, spread over 3,200 sq.ft of built-up area with 1,800 sq.ft garden. Features include a private swimming pool, home theater, Italian marble flooring, and modular kitchen. Located 10 mins from Whitefield IT hub with 24/7 security, clubhouse, and children\'s play area.',
        category: 'real-estate',
        totalValue: 12000000,
        totalTokens: 12000,
        availableTokens: 12000,
        pricePerToken: 1000,
        location: 'Bangalore, India',
        annualYield: 7.2,
        createdBy: admin._id
      },
      {
        name: 'City Center Mall — Anchor Unit',
        description: 'Prime retail space of 8,500 sq.ft on the ground floor of City Center Mall, one of Delhi NCR\'s busiest shopping destinations. Currently leased to a leading fashion brand with a 10-year lock-in period. Footfall averages 15,000+ visitors daily. Includes dedicated parking, escalator access, and frontage on the main atrium.',
        category: 'real-estate',
        totalValue: 30000000,
        totalTokens: 30000,
        availableTokens: 30000,
        pricePerToken: 1000,
        location: 'Delhi NCR, India',
        annualYield: 11.5,
        createdBy: admin._id
      },
      {
        name: 'Oceanfront Studio Apartments — Block C',
        description: 'Beachfront studio apartment complex in Goa comprising 12 fully-furnished units, each 450 sq.ft. Designed for short-stay tourism with year-round demand. Managed by a professional hospitality company with an average occupancy rate of 82%. Includes shared rooftop lounge, co-working space, and direct beach access.',
        category: 'real-estate',
        totalValue: 8000000,
        totalTokens: 16000,
        availableTokens: 16000,
        pricePerToken: 500,
        location: 'Goa, India',
        annualYield: 10.3,
        createdBy: admin._id
      },
      {
        name: 'Heritage Haveli — Boutique Hotel',
        description: 'Restored 200-year-old heritage haveli converted into a 16-room boutique hotel in the old city of Jaipur. Listed as a heritage property by the Rajasthan Tourism Department. Features traditional Rajasthani architecture, courtyard dining, rooftop restaurant, and curated cultural experiences. Rated 4.8/5 on major booking platforms.',
        category: 'real-estate',
        totalValue: 18000000,
        totalTokens: 18000,
        availableTokens: 18000,
        pricePerToken: 1000,
        location: 'Jaipur, India',
        annualYield: 8.8,
        createdBy: admin._id
      }
    ]);

    console.log('✅ Properties seeded:', assets.length);
    console.log('\n📧 Admin Login: admin@assetchain.com / admin123');
    console.log('📧 User Login: john@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
