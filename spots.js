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

const lureMappings = {
	elusive: "strong",
	wayfinder: "wise",
	pearl: "glimmering",
	treasure: "greedy",
	spirit: "lucky",
};

function calculatePerks(perks) {
	const returnedPerks = {};

	for (const perk of perks) {
		if (perk.toLowerCase().includes("hook")) {
			if (returnedPerks.hooks == undefined) returnedPerks.hooks = {};
			const values = perk.toLowerCase().split(" ");
			returnedPerks.hooks[values[1]] = values[0].replaceAll(/[+%]/g, "");
		} else if (perk.toLowerCase().includes("magnet")) {
			if (returnedPerks.magnets == undefined) returnedPerks.magnets = {};
			const values = perk.toLowerCase().split(" ");
			returnedPerks.magnets[values[1]] = values[0].replaceAll(
				/[+%]/g,
				""
			);
		} else {
			if (returnedPerks.lures == undefined) returnedPerks.lures = {};
			const values = perk.toLowerCase().split(" ");
			values[1] = lureMappings[values[1]];
			returnedPerks.lures[values[1]] = values[0].replaceAll(/[+%]/g, "");
		}
	}

	return returnedPerks;
}

export function addFishingSpot(
	island,
	cords,
	uuid,
	username,
	shareUser,
	perks
) {
	if (fishingSpots[island] === undefined) {
		return;
	}
	const fishingSpot = fishingSpots[island].get(cords);

	if (fishingSpot === undefined) {
		let foundBy = username;

		if (!shareUser || shareUser.toString().toLowerCase() === "false") {
			foundBy = null;
		}

		const perkData = calculatePerks(perks);
		const color = perks[0].split(" ")[1].toLowerCase();

		fishingSpots[island].set(cords, {
			foundBy,
			color,
			perks: perkData,
		});
		return {
			island,
			spot: {
				cords,
				foundBy,
				color,
				perks: perkData,
			},
		};
	}

	// Spot already exists
	return null;
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
