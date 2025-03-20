import express from "express";
import { createChannel, createSession } from "better-sse";
import { addFishingSpot, getFishingSpots, resetFishingSpots } from "./spots.js";
import cron from "node-cron";

const app = express();
const port = 8879;

app.use(express.json());

const channel = createChannel();

app.get("/spots", async (req, res) => {
	res.appendHeader("Access-Control-Allow-Origin", "*");
	const session = await createSession(req, res);

	channel.register(session);

	session.push(getFishingSpots());
});

app.post("/spots", async (req, res) => {
	const body = req.body;

	const added = addFishingSpot(
		body.island,
		body.cords,
		body.uuid,
		body.username,
		body.shareUser,
		body.perks
	);

	if (added != null) {
		channel.broadcast(added);
	}

	res.send("OK");
});

app.listen(port, () => {
	console.log(`FishyMap API listening on port ${port}`);
});

cron.schedule("0 * * * *", () => {
	resetFishingSpots();
	channel.broadcast(getFishingSpots(),"CLEAR");
});
