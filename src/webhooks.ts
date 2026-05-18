import { strava } from './strava.js';
import { deleteActivity, deleteAllActivities, getAndProcessActivity } from './activity.js';

export const WEBHOOK_URL = 'https://staging.eganride.org/ardis/webhook';

export function registerWebhooks() {
	strava.webhooks.onActivityCreate(async (event, athleteId) => {
		console.log('onActivityCreate');
		if (event.object_type == 'activity') {
			await getAndProcessActivity(event.object_id, athleteId);
		}
	});

	strava.webhooks.onActivityUpdate(async (event, athleteId) => {
		if (event.object_type == 'activity') {
			// TODO: Filter on updates
			await getAndProcessActivity(event.object_id, athleteId);
		}
	});

	strava.webhooks.onActivityDelete(async (event, athleteId) => {
		await deleteActivity(event.object_id, athleteId);
	});

	strava.webhooks.onAthleteDeauthorize(async (event, athleteId) => {
		await deleteAllActivities(athleteId);
		strava.storage.deleteTokens(athleteId.toString());
	});
}
