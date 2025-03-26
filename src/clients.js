const clients = new Map();

export function addClient(secret, uuid) {
	const ttl = Date.now() + 1000 * 60 * 60 * 24;

	clients.set(secret, { uuid, ttl });
}

export function removeClient(secret) {
	clients.delete(secret);
}

export function checkClient(secret, uuid) {
	const client = clients.get(secret);
	
	if (client == null) return false;
	if (client.uuid != uuid) return false;
	return true;
}

export function getClients() {
	return clients;
}

export function clearClients() {
	const now = Date.now();
	clients.forEach((client, secret) => {
		if (client.ttl <= now) clients.delete(secret);
	});
}
