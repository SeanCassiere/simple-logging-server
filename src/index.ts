import { env } from "./config/env";
import { makeFastifyServer } from "./config/server";

const packageJson = require("../package.json");

async function main() {
  const fastify = await makeFastifyServer({ packageVersion: packageJson?.version });

  if (env.FREEZE_DB_WRITES) {
    console.warn("  ⚠️ ⚠️ ⚠️ ⚠️\n  Database writes are currently frozen\n  ⚠️ ⚠️ ⚠️ ⚠️\n");
  }

  try {
    fastify.listen(
      { port: Number(env.PORT), host: env.NODE_ENV !== "production" ? "127.0.0.1" : "0.0.0.0" },
      (err, address) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        console.log(`${packageJson.name} (${env.NODE_ENV} - ${packageJson.version}) listening on ${address} `);
      }
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main().catch((err) => console.error(err));
