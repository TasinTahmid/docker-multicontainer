const keys = require("./keys");
const redis = require("redis");

const redisClient = redis.createClient({
	socket: {
		host: keys.redisHost,
		port: keys.redisPort,
		reconnectStrategy: () => 1000,
	},
});

const sub = redisClient.duplicate();

function fib(index) {
	if (index < 2) return 1;

	return fib(index - 1) + fib(index - 2);
}

async function start() {
	await redisClient.connect();
	await sub.connect();

	await sub.subscribe("insert", async (message) => {
		await redisClient.hSet("values", message, fib(parseInt(message)));
	});

	console.log("Worker subscribed to insert");
}

start().catch((err) => {
	console.error("Worker failed to start:", err);
	process.exit(1);
});
