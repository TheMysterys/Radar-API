import express from "express";
import { createChannel, createSession } from "better-sse";
import {
	addFishingSpot,
	getFishingSpots,
	resetFishingSpots,
	unregisterSecret,
} from "./spots.js";
import cron from "node-cron";
import { addClient, checkClient, clearClients, getClients } from "./clients.js";

const app = express();
const port = 8879;

app.use(express.json());

const channel = createChannel();

app.get("/", (req, res) => {
	res.send("Alive");
});

app.get("/spots", async (req, res) => {
	res.appendHeader("Access-Control-Allow-Origin", "*");
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
		body.username == undefined ||
		body.shareUser == undefined ||
		body.perks == undefined
	) {
		return res.sendStatus(400);
	}

	if (secret == undefined || !checkClient(secret, body.uuid)) {
		return res.sendStatus(401);
	}

	const added = addFishingSpot(
		body.island,
		body.cords,
		body.uuid,
		body.username,
		body.shareUser,
		body.perks
	);

	if (added != null) {
		res.status(201);
		channel.broadcast(added);
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
