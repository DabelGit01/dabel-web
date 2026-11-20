import { PrismaClient } from "./generated/postgres";

/**
 * Connection errors that mean "the query never reached the database", so it is
 * always safe to retry (reads and writes alike):
 *   P1001 can't reach server · P1002 server timed out · P1017 server closed connection
 *   + PrismaClientInitializationError (engine couldn't connect)
 */
const RETRYABLE_CODES = new Set(["P1001", "P1002", "P1017"]);
const MAX_RETRIES = 2;

function isConnectionError(err: unknown) {
	if (!(err instanceof Error)) return false;
	const code = (err as { code?: string; errorCode?: string }).code ?? (err as { errorCode?: string }).errorCode;
	return (
		(code !== undefined && RETRYABLE_CODES.has(code)) ||
		err.constructor.name === "PrismaClientInitializationError" ||
		/Can't reach database server|Timed out fetching a new connection|Server has closed the connection/i.test(err.message)
	);
}

const prismaClientSingleton = () =>
	new PrismaClient().$extends({
		query: {
			// Ride out brief network drops between Nigeria and the eu-west-1 database.
			async $allOperations({ args, query, operation, model }) {
				for (let attempt = 0; ; attempt++) {
					try {
						return await query(args);
					} catch (err) {
						if (attempt >= MAX_RETRIES || !isConnectionError(err)) throw err;
						console.warn(`[prisma] ${model ?? ""}.${operation} connection failed, retry ${attempt + 1}/${MAX_RETRIES}`);
						await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
					}
				}
			},
		},
	});

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
