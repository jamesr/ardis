import { type StravaActivity } from 'strava-sdk';
import { strava } from './strava.js';
import { type Egan, findEganByDate } from './egan.js';
import { deleteAllResults, deleteResults, storeResult } from './results.js';

export async function getAndProcessActivity(activityId: number, athleteId: number) {
	console.log(`Processing activity ${activityId} from athlete ${athleteId}`);
	const activity: StravaActivity = await strava.getActivityWithRefresh(activityId.toString(), athleteId.toString());

	// console.log(`activity:`, JSON.stringify(activity));

	if (activity.visibility != 'everyone') {
		console.log(`visibility is ${activity.visibility}, deleting`);
		deleteActivity(activityId, athleteId);
	}

	const activityDay = activity.start_date.substring(0, activity.start_date.indexOf('T'));

	const egan = findEganByDate(activityDay);
	if (!egan) {
		console.log(`Couldn't find egan on ${activityDay}`);
		return;
	}
	if (!shouldProcess(activity, egan)) {
		console.log(`Shouldn't process activity`);
		return;
	}

	const processed = processActivity(activity, athleteId, egan);
	console.log('processed activity: ', JSON.stringify(processed, null, 2));

	storeResult(processed, egan.name);
}

export function shouldProcess(activity: StravaActivity, egan: Egan): boolean {
	if (activity.visibility != 'everyone') {
		console.log('non-public event', activity.visibility);
		return false;
	}

	const activitySegments = new Set(activity.segment_efforts?.map((effort) => effort.segment.id));
	console.log(activitySegments.isDisjointFrom(egan.segments));
	if (activitySegments.isDisjointFrom(egan.segments)) {
		console.log('empty intersection with egan segments');
		return false;
	}

	return true;
}

export interface ProcessedSegment {
	readonly segment_id: number;
	readonly athlete_id: number;
	readonly activity_id: number;
	readonly segment_effort_id: number;
	readonly time: number;
	readonly power: number | undefined;
	readonly pr_rank: number | undefined;
	readonly kom_rank: number | undefined;
}

export interface ProcessedActivity {
	readonly activity_id: number;
	readonly athlete_id: number;
	readonly device_name: string;
	readonly egan_name: string;
	readonly efforts: ProcessedSegment[];
}

export function processActivity(activity: StravaActivity, athleteId: number, egan: Egan): ProcessedActivity {
	//   check pr_rank
	//   check kom_rank
	// save activity.device_name}
	var efforts: ProcessedSegment[] = [];
	for (var effort of activity.segment_efforts ?? []) {
		const name = effort.name;
		if (!egan.segments.has(effort.segment.id)) {
			console.log(`skipping effort on ${name}`);
			continue;
		}
		var processed = {
			segment_id: effort.segment.id,
			athlete_id: athleteId,
			activity_id: activity.id,
			segment_effort_id: effort.id,
			time: effort.elapsed_time, // Should this be moving_time ?
			power: effort.device_watts ? effort.average_watts : null,
			pr_rank: effort.pr_rank,
			kom_rank: effort.kom_rank,
		} as ProcessedSegment;
		console.log(`processed effort on ${name}: `, JSON.stringify(processed));
		efforts.push(processed);
	}

	return {
		activity_id: activity.id,
		athlete_id: athleteId,
		device_name: activity.device_name,
		egan_name: egan.name,
		efforts,
	} as ProcessedActivity;
}

export async function deleteActivity(activityId: number, athleteId: number) {
	deleteResults(activityId, athleteId);
}

export async function deleteAllActivities(athleteId: number) {
	deleteAllResults(athleteId);
}
