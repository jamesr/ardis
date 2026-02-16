import { type StravaActivity } from 'strava-sdk';
import { strava } from './strava.js';
import { type Egan, findEgan } from './egan.js';

export async function getAndProcessActivity(activityId: number, athleteId: number) {
	console.log(`Processing activity ${activityId} from athlete ${athleteId}`);
	const activity: StravaActivity = await strava.getActivityWithRefresh(activityId.toString(), athleteId.toString());

	console.log(`activity ${activity}`);

	if (activity.visibility != 'public') {
		console.log(`visibility is ${activity.visibility}, deleting`);
		deleteActivity(activityId, athleteId);
	}

	const activityDay = activity.start_date.substring(0, activity.start_date.indexOf('T'));

	const egan = findEgan(activityDay);
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
}

export function shouldProcess(activity: StravaActivity, egan: Egan): boolean {
	if (activity.visibility != 'public') {
		console.log('non-public event', activity.visibility);
		return false;
	}

	const activitySegments = new Set(activity.segment_efforts?.map((effort) => effort.id));
	if (activitySegments.intersection(egan.segments).size == 0) {
		console.log('empty intersection with egan segments');
		return false;
	}

	return true;
}

interface ProcessedSegment {
	id: number;
	time: number;
	power: number | undefined;
	pr_rank: number | undefined;
	kom_rank: number | undefined;
}

interface ProcessedActivity {
	activity_id: number;
	athlete_id: number;
	device_name: string;
	efforts: ProcessedSegment[];
}

async function processActivity(activity: StravaActivity, athleteId: number, egan: Egan) {
	//   check pr_rank
	//   check kom_rank
	// save activity.device_name}
	const efforts = activity.segment_efforts
		?.filter((effort) => {
			return egan.segments.has(effort.segment.id);
		})
		.map((effort) => {
			return {
				id: effort.id,
				time: effort.elapsed_time, // Should this be moving_time ?
				power: effort.device_watts ? effort.average_watts : null,
				pr_rank: effort.pr_rank,
				kom_rank: effort.kom_rank,
			} as ProcessedSegment;
		});
	return {
		activity_id: activity.id,
		athlete_id: athleteId,
		device_name: activity.device_name,
		efforts: efforts,
	} as ProcessedActivity;
}

export async function deleteActivity(_activityId: number, _athleteId: number) {
	// TODO: Find and delete this activity.
}

export async function deleteAllActivities(_athleteId: number) {
	// TODO: Find and delete all activities from this athlete.
}
