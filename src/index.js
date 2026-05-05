import express from "express";
import { createChannel, createSession } from "better-sse";
import {
	addFishingSpot,
	getFishingSpots,
	resetFishingSpots,
	unregisterSecret,
} from "./spots.js";
import cron from "node-cron";
import { addClient, checkClient, clearClients } from "./clients.js";

const app = express();
const port = process.env.PORT;

app.disable("x-powered-by");
app.use(express.json());

app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	next();
});

const channel = createChannel();

app.get("/", (req, res) => {
	res.send("Alive");
});

app.get("/spots", async (req, res) => {
	const session = await createSession(req, res);

	channel.register(session);

	session.push(getFishingSpots());
});

app.post("/spots", async (req, res) => {
	const body = req.body;
	const secret = req.headers.authorization;

	if (
		body.island == undefined ||
		body.cords == undefined ||
		body.uuid == undefined ||
		body.shareUser == undefined ||
		body.perks == undefined
	) {
		return res.sendStatus(400);
	}

	if (secret == undefined || !checkClient(secret, body.uuid)) {
		return res.sendStatus(401);
	}

	const result = await addFishingSpot(
		body.island,
		body.cords,
		body.uuid,
		body.shareUser,
		body.perks,
		body.stock,
	);

	if (result.added) {
		res.status(201);
		channel.broadcast(result.data);
	}

	if (result.exists) {
		res.status(200);
	}

	if (result.updated) {
		res.status(204);
		channel.broadcast(result.data);
	}

	if (result.error) {
		res.status(400);
		return res.send(result.error);
	}

	res.send("OK");
});

app.post("/register", async (req, res) => {
	const { uuid } = req.body;
	const secret = req.headers.authorization;

	if (!uuid || !secret) return res.sendStatus(400);

	addClient(secret, uuid);

	res.send("OK");
});

app.post("/unregister", async (req, res) => {
	const secret = req.headers.authorization;

	if (!secret) return res.sendStatus(400);

	unregisterSecret(secret);

	res.send("OK");
});

app.listen(port, () => {
	console.log(`FishyMap API listening on port ${port}`);
});

cron.schedule("0 * * * *", () => {
	// Clear old client secrets
	clearClients();

	// Reset Fishing spots
	resetFishingSpots();
	channel.broadcast(getFishingSpots(), "CLEAR");
});
