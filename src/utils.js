export function createProfile(uuid) {
	return {
		uuid,
		privateProfile: true,
		spotsFound: 1,
		islands: {
			temperate_1: 0,
			temperate_2: 0,
			temperate_3: 0,
			tropical_1: 0,
			tropical_2: 0,
			tropical_3: 0,
			barren_1: 0,
			barren_2: 0,
			barren_3: 0,
		},
		spotTypes: {
			hooks: {
				strong: 0,
				wise: 0,
				glimmering: 0,
				greedy: 0,
				lucky: 0,
			},
			magnets: {
				xp: 0,
				fish: 0,
				pearl: 0,
				treasure: 0,
				spirit: 0,
			},
			lures: {
				strong: 0,
				wise: 0,
				glimmering: 0,
				greedy: 0,
				lucky: 0,
			},
		},
		achievements: [],
	};
}

export function calculatePerks(perks) {
	const returnedPerks = {
		hooks: {},
		magnets: {},
		lures: {},
	};

	const lureMappings = {
		elusive: "strong",
		wayfinder: "wise",
		pearl: "glimmering",
		treasure: "greedy",
		spirit: "lucky",
	};
	const validHooks = ["wise", "strong", "glimmering", "greedy", "lucky"];
	const validMagnets = ["xp", "fish", "pearl", "treasure", "spirit"];
	for (const perk of perks) {
		const lower = perk.toLowerCase();
		const [rawValue, rawName] = lower.split(" ");
		const value = rawValue.replace(/[+%]/g, "");

		if (lower.includes("hook")) {
			if (validHooks.includes(rawName)) {
				returnedPerks.hooks[rawName] = value;
			} else {
				console.warn(`Unknown hook perk: ${rawName}`);
				return null;
			}
		} else if (lower.includes("magnet")) {
			if (validMagnets.includes(rawName)) {
				returnedPerks.magnets[rawName] = value;
			} else {
				console.warn(`Unknown magnet perk: ${rawName}`);
				return null;
			}
		} else {
			const mappedName = lureMappings[rawName];
			if (mappedName) {
				returnedPerks.lures[mappedName] = value;
			} else {
				console.warn(`Unknown lure prefix: ${rawName}`);
				return null;
			}
		}
	}

	return returnedPerks;
}

const stockLevels = {
	DEPLETED: 0,
	LOW: 1,
	MEDIUM: 2,
	HIGH: 3,
	VERY_HIGH: 4,
	PLENTIFU: 5,
};

export function compareStock(original, newValue) {
	return stockLevels[original] < stockLevels[newValue];
}
