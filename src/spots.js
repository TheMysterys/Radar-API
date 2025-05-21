import mongoClient from "./connection.js";
import { calculatePerks, createProfile } from "./utils.js";

export const fishingSpots = {
	temperate_1: new Map(),
	temperate_2: new Map(),
	temperate_3: new Map(),
	tropical_1: new Map(),
	tropical_2: new Map(),
	tropical_3: new Map(),
	barren_1: new Map(),
	barren_2: new Map(),
	barren_3: new Map(),
};

// Database Connection
const dbName = process.env.DEV === "true" ? "radar-dev" : "radar"
const db = mongoClient.db(dbName);

// Shared Secret code
const sharedSecrets = new Map();

export function confirmSecret(uuid, secret) {
	if (!sharedSecrets.has(uuid)) {
		return false;
	}
	return sharedSecrets.get(uuid) === secret;
}

export function registerSecret(uuid, secret) {
	sharedSecrets.set(uuid, secret);
}

export function unregisterSecret(uuid) {
	sharedSecrets.delete(uuid);
}

export async function addFishingSpot(island, cords, uuid, shareUser, perks) {
	if (fishingSpots[island] === undefined) {
		return { added: false, error: "Unknown island" };
	}
	const fishingSpot = fishingSpots[island].get(cords);

	if (fishingSpot === undefined) {
		const perkData = calculatePerks(perks);
		if (perkData === null) {
			console.warn(
				`UUID: ${uuid} tried sending false perk data. (${perks})`
			);
			return { added: false, error: "False perk data was sent" };
		}

		let foundBy;

		if (!shareUser || shareUser.toString().toLowerCase() === "false") {
			foundBy = null;
		} else {
			const res = await fetch(
				`https://mojang-api.svc.noxcrew.online/username/${uuid}`,
				{
					method: "GET",
					headers: {
						"User-Agent": "Radar(radar.themysterys.com)",
					},
				}
			);

			if (res.status != 200) {
				return {
					added: false,
					error: `Unable to fetch username from UUID: ${uuid}`,
				};
			}

			const data = await res.json();

			foundBy = data.name;
		}

		const color = perks[0].split(" ")[1].toLowerCase();

		fishingSpots[island].set(cords, {
			foundBy,
			color,
			perks: perkData,
		});

		const updateObject = {
			spotsFound: 1,
			[`islands.${island}`]: 1,
		};

		// Increment perk types
		for (const category in perkData) {
			const perks = perkData[category];
			for (const perkName in perks) {
				updateObject[`spotTypes.${category}.${perkName}`] = 1;
			}
		}

		const result = await db.collection("profiles").updateOne(
			{ uuid },
			{
				$inc: updateObject,
			}
		);

		if (result.modifiedCount == 0) {
			const profile = createProfile(uuid);

			profile.islands[island] = 1;

			for (const category in perkData) {
				if (profile.spotTypes[category]) {
					for (const perkName in perkData[category]) {
						if (
							profile.spotTypes[category].hasOwnProperty(perkName)
						) {
							profile.spotTypes[category][perkName] += 1;
						}
					}
				}
			}

			await db.collection("profiles").insertOne(profile);
		}

		return {
			added: true,
			data: {
				island,
				spot: {
					cords,
					foundBy,
					color,
					perks: perkData,
				},
			},
		};
	}

	// Spot already exists
	return { added: false, exists: true };
}

export function resetFishingSpots() {
	for (const island in fishingSpots) {
		fishingSpots[island].clear();
	}
}

export function getFishingSpots() {
	const spots = {};

	for (const [key, value] of Object.entries(fishingSpots)) {
		spots[key] = Array.from(value.entries()).map(([cords, data]) => {
			return {
				cords,
				...data,
			};
		});
	}

	return spots;
}
