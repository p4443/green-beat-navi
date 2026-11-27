// 運営状態のサーバー永続化ストア(サーバー専用)。GBN-SEC-001 6-6 / B-3。
// - OPERATIONS_STORE=memory   : プロセス内メモリ(単一サーバーのLANデモ・E2E用)
// - OPERATIONS_STORE=firestore: Cloud Firestore(本番。Cloud Run のメタデータ認証を
//   使用するため追加シークレット不要。GBN-DEP-001 7章)
// - 未設定                     : local(従来の端末内localStorageデモ)
import {
  createInitialOperationsState,
  isOperationsState,
  operationsReducer,
  type OperationsAction,
  type OperationsState,
} from "@/data/operations";

export type OperationsStoreMode = "local" | "memory" | "firestore";

export function operationsStoreMode(): OperationsStoreMode {
  const value = process.env.OPERATIONS_STORE;
  return value === "memory" || value === "firestore" ? value : "local";
}

type OperationsStore = {
  read(): Promise<OperationsState>;
  write(state: OperationsState): Promise<void>;
};

// --- memory ストア(globalThis に保持し、モジュール再読込後も維持する) ---

const memoryGlobal = globalThis as typeof globalThis & {
  __gbnOperationsState?: OperationsState;
};

const memoryStore: OperationsStore = {
  async read() {
    return memoryGlobal.__gbnOperationsState ?? createInitialOperationsState();
  },
  async write(state) {
    memoryGlobal.__gbnOperationsState = state;
  },
};

// --- Firestore ストア(RESTのみ・依存パッケージなし) ---

const FIRESTORE_DOC = "green-beat/operations";

type MetadataToken = { access_token: string; expires_in: number };

const tokenCache: { token?: string; expiresAt?: number } = {};

async function metadataFetch(path: string): Promise<string> {
  const response = await fetch(
    `http://metadata.google.internal/computeMetadata/v1/${path}`,
    { headers: { "Metadata-Flavor": "Google" } },
  );
  if (!response.ok) {
    throw new Error(`metadata ${path}: ${response.status}`);
  }
  return response.text();
}

async function firestoreProjectId(): Promise<string> {
  return (
    process.env.GOOGLE_CLOUD_PROJECT ?? (await metadataFetch("project/project-id"))
  );
}

async function firestoreToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache.token && tokenCache.expiresAt && now < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  const raw = await metadataFetch(
    "instance/service-accounts/default/token",
  );
  const parsed = JSON.parse(raw) as MetadataToken;
  tokenCache.token = parsed.access_token;
  // 期限の60秒前に失効扱いにする
  tokenCache.expiresAt = now + (parsed.expires_in - 60) * 1000;
  return parsed.access_token;
}

async function firestoreDocUrl(): Promise<string> {
  const projectId = await firestoreProjectId();
  const emulator = process.env.FIRESTORE_EMULATOR_HOST;
  const origin = emulator
    ? `http://${emulator}`
    : "https://firestore.googleapis.com";
  return `${origin}/v1/projects/${projectId}/databases/(default)/documents/${FIRESTORE_DOC}`;
}

async function firestoreHeaders(): Promise<Record<string, string>> {
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return { "Content-Type": "application/json" };
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${await firestoreToken()}`,
  };
}

const firestoreStore: OperationsStore = {
  async read() {
    const response = await fetch(await firestoreDocUrl(), {
      headers: await firestoreHeaders(),
      cache: "no-store",
    });
    if (response.status === 404) {
      return createInitialOperationsState();
    }
    if (!response.ok) {
      throw new Error(`firestore read failed: ${response.status}`);
    }
    const doc = (await response.json()) as {
      fields?: { json?: { stringValue?: string } };
    };
    const raw = doc.fields?.json?.stringValue;
    if (!raw) {
      return createInitialOperationsState();
    }
    const parsed: unknown = JSON.parse(raw);
    return isOperationsState(parsed) ? parsed : createInitialOperationsState();
  },
  async write(state) {
    const response = await fetch(await firestoreDocUrl(), {
      method: "PATCH",
      headers: await firestoreHeaders(),
      body: JSON.stringify({
        fields: { json: { stringValue: JSON.stringify(state) } },
      }),
    });
    if (!response.ok) {
      throw new Error(`firestore write failed: ${response.status}`);
    }
  },
};

function activeStore(): OperationsStore | null {
  switch (operationsStoreMode()) {
    case "memory":
      return memoryStore;
    case "firestore":
      return firestoreStore;
    default:
      return null;
  }
}

export async function readOperationsState(): Promise<OperationsState | null> {
  const store = activeStore();
  if (!store) {
    return null;
  }
  return store.read();
}

export async function applyOperationsAction(
  action: OperationsAction,
): Promise<OperationsState | null> {
  const store = activeStore();
  if (!store) {
    return null;
  }
  const current = await store.read();
  const next = operationsReducer(current, action);
  await store.write(next);
  return next;
}
