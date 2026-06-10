import "server-only";
import { CreateDatabaseOperation, DocumentStore } from "ravendb";
import type { IDocumentStore } from "ravendb";

const RAVENDB_URL = process.env.RAVENDB_URL ?? "http://localhost:8080";
const RAVENDB_DATABASE = process.env.RAVENDB_DATABASE ?? "demo";

declare global {
  // eslint-disable-next-line no-var
  var __ravendbStore: IDocumentStore | undefined;
  // eslint-disable-next-line no-var
  var __ravendbDbReady: Promise<void> | undefined;
}

function createStore(): IDocumentStore {
  const store = new DocumentStore(RAVENDB_URL, RAVENDB_DATABASE);
  store.initialize();
  return store;
}

function getStore(): IDocumentStore {
  if (!globalThis.__ravendbStore) {
    globalThis.__ravendbStore = createStore();
  }
  return globalThis.__ravendbStore;
}

async function ensureDatabase(store: IDocumentStore): Promise<void> {
  try {
    await store.maintenance.server.send(
      new CreateDatabaseOperation({ databaseName: RAVENDB_DATABASE }),
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!/already exists/i.test(msg)) throw err;
  }
}

export async function withStore<T>(
  fn: (store: IDocumentStore) => Promise<T>,
): Promise<T> {
  const store = getStore();
  if (!globalThis.__ravendbDbReady) {
    globalThis.__ravendbDbReady = ensureDatabase(store);
  }
  await globalThis.__ravendbDbReady;
  return fn(store);
}

export const ravenConfig = { url: RAVENDB_URL, database: RAVENDB_DATABASE };
