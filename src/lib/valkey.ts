import { createClient, type ValkeyClientType } from "@valkey/client";

const globalForValkey = globalThis as unknown as {
  valkey: ValkeyClientType | undefined;
};

export const valkey = globalForValkey.valkey || createClient({
  url: process.env.VALKEY_URL, // Make sure VALKEY_URL is set (e.g., redis://:password@valkey:6379)
});

if (!globalForValkey.valkey) {
  globalForValkey.valkey = valkey;
  valkey.connect().catch((err) => {
    console.error("Valkey connection error", err);
  });
}

// Cleanup on process exit
process.on("exit", async () => {
  if (valkey.isOpen) {
    await valkey.quit();
  }
});

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    if (valkey.isOpen) {
      await valkey.quit();
    }
    process.exit();
  });
});

export default valkey;
