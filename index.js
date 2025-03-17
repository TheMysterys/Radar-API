import express from "express";
import { createChannel, createSession } from "better-sse";
import {
	addFishingSpot,
	fishingSpots,
	getFishingSpots,
	removeFishingSpot,
	resetFishingSpots,
} from "./spots.js";
import cron from "node-cron";

const app = express();
const port = 8080;

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

	console.log(body);

	const added = addFishingSpot(
		body.island,
		body.cords,
		body.uuid,
		body.username,
		body.shareUser,
		body.perks
	);

	if (added) {
		channel.broadcast(getFishingSpots());
	}

	res.send("OK");
});

/* 
app.post("/delete-spot", async (req, res) => {
	const body = req.body;

	console.log(body);

	removeFishingSpot(body.island, body.cords, body.uuid)

	channel.broadcast(getFishingSpots())

	res.send("OK")
}); */

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

cron.schedule("*/5 * * * *", () => {
	console.log("Resetting fishing spots");
	resetFishingSpots();
	channel.broadcast(getFishingSpots());
});
