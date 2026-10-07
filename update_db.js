require('dotenv').config();
const mongoose = require('mongoose');
const Asset = require('./models/Asset');

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  const images = {
    'Marina Bay Towers — Unit 42A': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    'Sunrise Commercial Complex — Block B': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    'Green Valley Residences — Villa Plot 7': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    'City Center Mall — Anchor Unit': 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=800&q=80',
    'Oceanfront Studio Apartments — Block C': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    'Heritage Haveli — Boutique Hotel': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
  };

  for (let [name, img] of Object.entries(images)) {
    const res = await Asset.updateOne({ name }, { $set: { image: img } });
    console.log(name, '-> updated:', res.modifiedCount);
  }
  process.exit(0);
}
fix();
