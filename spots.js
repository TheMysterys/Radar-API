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

export function addFishingSpot(island, cords, uuid, username, shareUser, perks) {
	if (fishingSpots[island] === undefined) {
		return;
	}
	const fishingSpot = fishingSpots[island].get(cords);

	if (fishingSpot === undefined) {
		console.log("Adding new fishing spot");
		
		let foundBy = username;

		if (!shareUser || shareUser.toString().toLowerCase() === "false") {
			foundBy = null
		}
		
		fishingSpots[island].set(cords, {
			foundBy,
			perks,
		});
		return true;
	}

	// Spot already exists
	return false;
}

export function resetFishingSpots() {
	for (const island in fishingSpots) {
		fishingSpots[island].clear()
	}
}

export function getFishingSpots() {
	const spots = {};

	for (const [key, value] of Object.entries(fishingSpots)) {
		spots[key] = Array.from(value.entries()).map(
			([cords, data]) => {
				
				return {
					cords,
					...data
				};
			}
		);
	}

	return spots;
}
