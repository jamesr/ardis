import { StravaClient, MemoryStorage, type Route, type StravaActivity } from 'strava-sdk';
import type { DetailedSegment, SummarySegment } from './results-types.js';

export const WEBHOOKS_VERIFY_TOKEN = 'ardis-webhook-verify-token';

export const strava = new StravaClient({
	clientId: process.env.STRAVA_CLIENT_ID ?? 'test_client_id',
	clientSecret: process.env.STRAVA_CLIENT_SECRET ?? 'test_client_secret',
	webhooks: {
		verifyToken: WEBHOOKS_VERIFY_TOKEN,
	},
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

var segmentCache = new Map<number, SummarySegment>();
var routeCache = new Map<number, Route>();

export async function getRouteById(routeId: number, athleteId: number): Promise<Route | undefined> {
	if (routeCache.has(routeId)) {
		return routeCache.get(routeId);
	}
	const fetchedRoute = await strava.getRouteById(routeId.toString(), athleteId.toString());
	// TODO: Do we cache negative results?
	console.log(`cached route ${routeId}`);
	routeCache.set(routeId, fetchedRoute);
	return fetchedRoute;
}

export function getCachedRouteById(routeId: number): Route | undefined {
	return routeCache.get(routeId);
}

export async function fetchRouteIfNeeded(routeId: number, athleteId: number) {
	if (routeCache.has(routeId)) {
		return;
	}

	getRouteById(routeId, athleteId);
}
