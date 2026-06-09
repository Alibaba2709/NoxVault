import { existsSync, readFileSync } from "fs";
import { join } from "path";
import mongoose, { type Mongoose } from "mongoose";

type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cached;
}

function readMongoUriFromEnvFile(): string | undefined {
  for (const fileName of [".env.local", ".env"]) {
    const filePath = join(process.cwd(), fileName);

    if (!existsSync(filePath)) {
      continue;
    }

    const fileContent = readFileSync(filePath, "utf8");
    const match = fileContent.match(
      /^(?:DATABASE_URL|MONGODB_URI|MONGURI)\s*=\s*["']?(.+?)["']?\s*$/m,
    );

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  const uri =
    process.env.MONGODB_URI ??
    process.env.MONGURI ??
    process.env.DATABASE_URL ??
    readMongoUriFromEnvFile();

  if (!uri) {
    throw new Error(
      "Configura DATABASE_URL, MONGODB_URI oppure MONGURI in .env.local o .env nella cartella del progetto",
    );
  }

  cached.promise ??= mongoose.connect(uri, {
    bufferCommands: false,
  });

  cached.conn = await cached.promise;

  return cached.conn;
}
