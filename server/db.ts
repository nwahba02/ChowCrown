import crypto from 'node:crypto';
import { MongoClient, Collection, WithId } from 'mongodb';

let client: MongoClient | null = null;
let connected = false;

async function ensureConnected() {
  if (connected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in environment');

  const MAX_RETRIES = 3;
  let lastErr: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5_000,
        connectTimeoutMS: 5_000,
      });
      await client.connect();
      // Enforce one vote per token at the DB level.
      await client.db().collection('votes').createIndex({ tokenId: 1 }, { unique: true });
      connected = true;
      return;
    } catch (err) {
      lastErr = err;
      await client?.close().catch(() => {});
      client = null;
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  throw lastErr;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    connected = false;
  }
}

function col(name: string): Collection {
  return client!.db().collection(name);
}

// --- Interfaces ---

export interface Competition {
  id: string;
  title: string;
  category: string;
  city: string;
  quarter: string;
  description: string;
  image: string;
  active: boolean;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  dish: string;
  competitionId: string;
  location: string; // neighborhood or address shown to voters
  image: string;
  active: boolean;
}

export interface Token {
  id: string;
  competitionId: string;
  restaurantId: string;
  createdAt: string;
  redeemedAt: string | null;
}

export interface Vote {
  id: string;
  tokenId: string;
  competitionId: string;
  restaurantId: string;
  scores: Record<string, number>;
  notes: string;
  submittedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
}

// --- DB ---

export const db = {
  async ping(): Promise<void> {
    await ensureConnected();
    await client!.db().command({ ping: 1 });
  },

  async stats(): Promise<{ competitions: number; restaurants: number; votes: number; cities: string[] }> {
    await ensureConnected();
    const [competitions, restaurants, votes, cities] = await Promise.all([
      col('competitions').countDocuments({ active: true }),
      col('restaurants').countDocuments({ active: true }),
      col('votes').countDocuments(),
      col('competitions').distinct('city', { active: true }),
    ]);
    return { competitions, restaurants, votes, cities: cities as string[] };
  },

  competitions: {
    async list(): Promise<Competition[]> {
      await ensureConnected();
      const docs = await col('competitions').find({}).toArray();
      return docs.map(docToCompetition);
    },

    async findById(id: string): Promise<Competition | null> {
      await ensureConnected();
      const doc = await col('competitions').findOne({ id });
      if (!doc) return null;
      return docToCompetition(doc);
    },

    async create(data: Omit<Competition, 'id' | 'createdAt'>): Promise<Competition> {
      await ensureConnected();
      const competition: Competition = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      await col('competitions').insertOne({ ...competition });
      return competition;
    },

    async listAll(): Promise<Competition[]> {
      await ensureConnected();
      const docs = await col('competitions').find({}).sort({ createdAt: -1 }).toArray();
      return docs.map(docToCompetition);
    },

    async update(id: string, data: Partial<Omit<Competition, 'id' | 'createdAt'>>): Promise<Competition | null> {
      await ensureConnected();
      const result = await col('competitions').findOneAndUpdate(
        { id },
        { $set: data },
        { returnDocument: 'after' },
      );
      if (!result) return null;
      return docToCompetition(result);
    },
  },

  restaurants: {
    async listByCompetition(competitionId: string): Promise<Restaurant[]> {
      await ensureConnected();
      const docs = await col('restaurants').find({ competitionId, active: true }).toArray();
      return docs.map(docToRestaurant);
    },

    async findById(id: string): Promise<Restaurant | null> {
      await ensureConnected();
      const doc = await col('restaurants').findOne({ id });
      if (!doc) return null;
      return docToRestaurant(doc);
    },

    async create(data: Omit<Restaurant, 'id'>): Promise<Restaurant> {
      await ensureConnected();
      const restaurant: Restaurant = {
        ...data,
        id: crypto.randomUUID(),
      };
      await col('restaurants').insertOne({ ...restaurant });
      return restaurant;
    },

    async listAll(competitionId?: string): Promise<Restaurant[]> {
      await ensureConnected();
      const filter = competitionId ? { competitionId } : {};
      const docs = await col('restaurants').find(filter).toArray();
      return docs.map(docToRestaurant);
    },

    async update(id: string, data: Partial<Omit<Restaurant, 'id'>>): Promise<Restaurant | null> {
      await ensureConnected();
      const result = await col('restaurants').findOneAndUpdate(
        { id },
        { $set: data },
        { returnDocument: 'after' },
      );
      if (!result) return null;
      return docToRestaurant(result);
    },

    async remove(id: string): Promise<boolean> {
      await ensureConnected();
      const result = await col('restaurants').deleteOne({ id });
      return result.deletedCount > 0;
    },
  },

  tokens: {
    async findById(id: string): Promise<Token | null> {
      await ensureConnected();
      const doc = await col('tokens').findOne({ id });
      if (!doc) return null;
      return docToToken(doc);
    },

    async create(competitionId: string, restaurantId: string): Promise<Token> {
      await ensureConnected();
      const token: Token = {
        id: crypto.randomBytes(8).toString('hex'),
        competitionId,
        restaurantId,
        createdAt: new Date().toISOString(),
        redeemedAt: null,
      };
      await col('tokens').insertOne({ ...token });
      return token;
    },

    async createBatch(competitionId: string, restaurantId: string, count: number): Promise<Token[]> {
      await ensureConnected();
      const now = new Date().toISOString();
      const tokens: Token[] = Array.from({ length: count }, () => ({
        id: crypto.randomBytes(8).toString('hex'),
        competitionId,
        restaurantId,
        createdAt: now,
        redeemedAt: null,
      }));
      await col('tokens').insertMany(tokens.map((t) => ({ ...t })));
      return tokens;
    },

    async redeem(id: string): Promise<Token | null> {
      await ensureConnected();
      const result = await col('tokens').findOneAndUpdate(
        { id, redeemedAt: null },
        { $set: { redeemedAt: new Date().toISOString() } },
        { returnDocument: 'after' },
      );
      if (!result) return null;
      return docToToken(result);
    },
  },

  votes: {
    async create(data: Omit<Vote, 'id' | 'submittedAt'>): Promise<Vote | null> {
      await ensureConnected();
      const vote: Vote = {
        ...data,
        id: crypto.randomUUID(),
        submittedAt: new Date().toISOString(),
      };
      try {
        await col('votes').insertOne({ ...vote });
      } catch (err: unknown) {
        // Duplicate key — another concurrent request already submitted a vote for this token.
        if ((err as { code?: number }).code === 11000) return null;
        throw err;
      }
      return vote;
    },

    async existsForToken(tokenId: string): Promise<boolean> {
      await ensureConnected();
      const count = await col('votes').countDocuments({ tokenId }, { limit: 1 });
      return count > 0;
    },

    async getByCompetition(competitionId: string): Promise<Vote[]> {
      await ensureConnected();
      const docs = await col('votes').find({ competitionId }).toArray();
      return docs.map(docToVote);
    },

    async getAll(): Promise<Vote[]> {
      await ensureConnected();
      const docs = await col('votes').find({}).sort({ submittedAt: -1 }).toArray();
      return docs.map(docToVote);
    },
  },

  contacts: {
    async create(data: Omit<Contact, 'id' | 'submittedAt'>): Promise<Contact> {
      await ensureConnected();
      const contact: Contact = {
        ...data,
        id: crypto.randomUUID(),
        submittedAt: new Date().toISOString(),
      };
      await col('contacts').insertOne({ ...contact });
      return contact;
    },

    async list(): Promise<Contact[]> {
      await ensureConnected();
      const docs = await col('contacts').find({}).sort({ submittedAt: -1 }).toArray();
      return docs.map(docToContact);
    },
  },
};

// --- Converters ---

// Safe accessors — return typed value or a safe fallback if the field is absent or wrong type.
// This prevents `undefined as string` runtime surprises when documents have schema drift.
function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}
function bool(v: unknown, fallback = false): boolean {
  return typeof v === 'boolean' ? v : fallback;
}
function scoreMap(v: unknown): Record<string, number> {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, number>;
  return {};
}

function docToCompetition(doc: WithId<Document> | Record<string, unknown>): Competition {
  const d = doc as Record<string, unknown>;
  return {
    id:          str(d.id),
    title:       str(d.title),
    category:    str(d.category),
    city:        str(d.city),
    quarter:     str(d.quarter),
    description: str(d.description),
    image:       str(d.image),
    active:      bool(d.active, true),
    createdAt:   str(d.createdAt),
  };
}

function docToRestaurant(doc: WithId<Document> | Record<string, unknown>): Restaurant {
  const d = doc as Record<string, unknown>;
  return {
    id:            str(d.id),
    name:          str(d.name),
    dish:          str(d.dish),
    competitionId: str(d.competitionId),
    location:      str(d.location),
    image:         str(d.image),
    active:        bool(d.active, true),
  };
}

function docToToken(doc: WithId<Document> | Record<string, unknown>): Token {
  const d = doc as Record<string, unknown>;
  return {
    id:            str(d.id),
    competitionId: str(d.competitionId),
    restaurantId:  str(d.restaurantId),
    createdAt:     str(d.createdAt),
    redeemedAt:    typeof d.redeemedAt === 'string' ? d.redeemedAt : null,
  };
}

function docToVote(doc: WithId<Document> | Record<string, unknown>): Vote {
  const d = doc as Record<string, unknown>;
  return {
    id:            str(d.id),
    tokenId:       str(d.tokenId),
    competitionId: str(d.competitionId),
    restaurantId:  str(d.restaurantId),
    scores:        scoreMap(d.scores),
    notes:         str(d.notes),
    submittedAt:   str(d.submittedAt),
  };
}

function docToContact(doc: WithId<Document> | Record<string, unknown>): Contact {
  const d = doc as Record<string, unknown>;
  return {
    id:          str(d.id),
    name:        str(d.name),
    email:       str(d.email),
    subject:     str(d.subject),
    message:     str(d.message),
    submittedAt: str(d.submittedAt),
  };
}
