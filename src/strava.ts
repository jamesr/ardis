import { StravaClient, MemoryStorage } from 'strava-sdk';

export const strava = new StravaClient({
	clientId: process.env.STRAVA_CLIENT_ID ?? 'test_client_id',
	clientSecret: process.env.STRAVA_CLIENT_SECRET ?? 'test_client_secret',
	redirectUri: 'https://staging.eganride.org/ardis/callback',
	storage: new MemoryStorage(), // Use your own storage implementation for production
	onRateLimit: (info) => {
		console.log(`Rate limit: ${info.used15Min}/${info.limit15Min} (15min)`);
		console.log(`Rate limit: ${info.usedDaily}/${info.limitDaily} (daily)`);
	},
	logger: {
		debug: (msg, meta) => console.log(msg, meta),
		info: (msg, meta) => console.info(msg, meta),
		warn: (msg, meta) => console.warn(msg, meta),
		error: (msg, meta) => console.error(msg, meta),
	},
	onApiCall: (info) => console.log(`api call: ${info}`),
});
