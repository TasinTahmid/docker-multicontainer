const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const redis = require("redis");
const keys = require("./keys");

const app = express();
app.use(cors());
app.use(express.json());

const pgClient = new Pool({
	user: keys.pgUser,
	host: keys.pgHost,
	database: keys.pgDatabase,
	password: keys.pgPassword,
	port: keys.pgPort,
});

pgClient.on("error", (err) => console.error("Unexpected PG error:", err));

const redisClient = redis.createClient({
	socket: {
		host: keys.redisHost,
		port: keys.redisPort,
		reconnectStrategy: () => 1000,
	},
});
const redisPublisher = redisClient.duplicate();

app.get("/", (req, res) => {
	res.send("Hi");
});

app.get("/values/all", async (req, res) => {
	try {
		const values = await pgClient.query('SELECT * FROM "values"');
		res.send(values.rows);
	} catch (err) {
		console.error(err);
		res.status(500).send("Database error");
	}
});

app.get("/values/current", async (req, res) => {
	try {
		const values = await redisClient.hGetAll("values");
		res.send(values);
	} catch (err) {
		console.error(err);
		res.status(500).send("Redis error");
	}
});

app.post("/values", async (req, res) => {
	try {
		const index = req.body.index;
		if (parseInt(index) > 40) {
			return res.status(422).send("Index too high");
		}
		await redisClient.hSet("values", index, "Nothing yet!");
		await redisPublisher.publish("insert", index);
		await pgClient.query('INSERT INTO "values"(number) VALUES($1)', [index]);
		res.send({ working: true });
	} catch (err) {
		console.error(err);
		res.status(500).send("Server error");
	}
});

async function start() {
	await pgClient.query('CREATE TABLE IF NOT EXISTS "values" (number INT)');
	await redisClient.connect();
	await redisPublisher.connect();
	app.listen(5000, () => {
		console.log("Listening on port 5000");
	});
}

start().catch((err) => {
	console.error("Failed to start server:", err);
	process.exit(1);
});