import 'dotenv/config';
import crypto from 'node:crypto';
import { db } from './db.js';

async function seed() {
  console.log('Seeding fake data for LA Burger Crown Q1 2026...\n');

  // Competition
  const competition = await db.competitions.create({
    title: 'Burger Crown',
    category: 'Burgers',
    city: 'Los Angeles',
    quarter: 'Q1 2026',
    description: 'The ultimate battle for the best burger in Los Angeles. Six criteria, one champion.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    active: true,
  });
  console.log(`Competition: ${competition.title} (${competition.id})`);

  // Restaurants
  const restaurantDefs = [
    { name: 'Goldburger', dish: 'The Gold Standard', location: 'West Hollywood', city: 'Los Angeles', description: 'A double smash patty with aged cheddar and a 24-hour brioche bun.', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80' },
    { name: 'Burgerlords', dish: 'Classic Smash', location: 'Chinatown', city: 'Los Angeles', description: 'Griddle-smashed patty, American cheese, shredded lettuce, and burger sauce.', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=400&q=80' },
    { name: 'Mírate', dish: 'Birria Burger', location: 'Los Feliz', city: 'Los Angeles', description: 'A birria-braised beef patty dipped in consomé, topped with melted Oaxaca cheese.', image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=400&q=80' },
    { name: 'Bossa Nova Burger Bar', dish: 'Brazilian BBQ Burger', location: 'Silver Lake', city: 'Los Angeles', description: 'Char-grilled patty with Brazilian BBQ sauce, grilled pineapple, and crispy onions.', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=400&q=80' },
    { name: 'Irv\'s Burgers', dish: 'Irv\'s Original', location: 'West Hollywood', city: 'Los Angeles', description: 'An old-school diner smash burger, grilled onions, and a secret sauce recipe from 1980.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' },
  ];

  const restaurants = [];
  for (const def of restaurantDefs) {
    const r = await db.restaurants.create({ ...def, competitionId: competition.id, active: true });
    restaurants.push(r);
    console.log(`  Restaurant: ${r.name} — ${r.location} (${r.id})`);
  }

  // Score profiles — each restaurant has a personality
  const scoreProfiles: Record<string, () => Record<string, number>> = {
    [restaurants[0].id]: () => randScores(8.5, 9.5),   // Goldburger — consistently great
    [restaurants[1].id]: () => randScores(7.5, 9.0),   // Burgerlords — variable
    [restaurants[2].id]: () => randScores(7.0, 8.5),   // Mírate — solid mid-tier
    [restaurants[3].id]: () => randScores(8.0, 9.2),   // Bossa Nova — near the top
    [restaurants[4].id]: () => randScores(6.5, 8.0),   // Irv's — beloved but inconsistent
  };

  // Generate tokens and votes
  console.log('\nGenerating tokens and votes...');
  const voteCounts = [42, 38, 25, 35, 19];

  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i];
    const count = voteCounts[i];

    for (let j = 0; j < count; j++) {
      const token = await db.tokens.create(competition.id, restaurant.id);

      // Mark token redeemed
      await db.tokens.redeem(token.id);

      // Submit vote
      await db.votes.create({
        tokenId: token.id,
        competitionId: competition.id,
        restaurantId: restaurant.id,
        scores: scoreProfiles[restaurant.id](),
        notes: randomNote(),
      });
    }

    console.log(`  ${restaurant.name}: ${count} votes`);
  }

  // Leave a handful of unredeemed tokens to show the full token lifecycle
  console.log('\nGenerating 10 unredeemed tokens (to show pending state in Atlas)...');
  for (let i = 0; i < 10; i++) {
    const r = restaurants[i % restaurants.length];
    await db.tokens.create(competition.id, r.id);
  }

  console.log('\nDone. Check Atlas → Collections to see competitions, restaurants, tokens, and votes.');
  process.exit(0);
}

function randScores(min: number, max: number): Record<string, number> {
  const criteria = ['first_impressions', 'visual_appeal', 'protein', 'build', 'flavor', 'value'];
  const scores: Record<string, number> = {};
  for (const c of criteria) {
    scores[c] = Math.round((Math.random() * (max - min) + min) * 10) / 10;
  }
  return scores;
}

const NOTES = [
  'Amazing patty, perfectly seasoned.',
  'Bun was a little soggy but the flavor was great.',
  'Best burger I\'ve had in LA, hands down.',
  'Good but the wait was long.',
  'Crispy edges on the smash, loved it.',
  'Cheese pull was incredible.',
  'Would come back just for the sauce.',
  'Solid all around, nothing bad to say.',
  'Fries were even better than the burger.',
  '',
  '',
  '',
];

function randomNote() {
  return NOTES[Math.floor(Math.random() * NOTES.length)];
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
