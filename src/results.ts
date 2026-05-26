import { findEganByName, type Egan } from './egan.js';
import { type Request, type Response } from 'express';
import type { Club, RideEfforts } from './results-types.js';
import { getCachedRouteById } from './strava.js';
import type { ProcessedActivity, ProcessedSegment } from './activity.js';
import { getAthleteById } from './athlete.js';

var resultsByName = new Map<string, Array<ProcessedActivity>>();

function pushToMapEntry<K, V>(map: Map<K, V[]>, key: K, value: V) {
	if (!map.has(key)) {
		map.set(key, []);
	}
	map.get(key)?.push(value);
}

function computeResults(egan: Egan): RideEfforts | undefined {
	const title = egan.title;

	const club = {
		id: 469663,
		name: 'Egan',
		url: 'https://altovelo.org/egan',
	} as Club;

	const segmentIds: Array<number> = egan.segments.values().toArray();
	const segmentsInOrder: Array<number> = segmentIds.toSorted();
	const segments = {};

	const route = getCachedRouteById(egan.route);
	if (route == undefined) {
		console.log(`Could not find route ${egan.route}`);
		return undefined;
	}

	var resultsBySegment = new Map<number, ProcessedSegment[]>();

	for (const activity of resultsByName.get(egan.name) ?? []) {
		for (const effort of activity.efforts) {
			pushToMapEntry(resultsBySegment, effort.segment_id, effort);
		}
	}

	for (const segment of segmentsInOrder) {
		for (const effort of (resultsBySegment.get(segment) ?? []).toSorted((a, b) => a.time - b.time)) {
			var rank_women = 1;
			var rank_men = 1;
			var efforts = [];
			const athlete = getAthleteById(effort.athlete_id);
			if (athlete === undefined) {
				continue;
			}
			var effort_rank = rank_women;
			if (athlete.sex == 'F') {
				effort_rank = rank_women;
				rank_women++;
			} else {
				effort_rank = rank_men;
				rank_men++;
			}
			efforts.push({
				athlete_name: `${athlete.firstname!} ${athlete.lastname!}`,
				athlete_link: `/athletes/${athlete.id}`,
				rank: effort_rank,
				athlete_id: athlete.id!.toString(),
				activity_id: effort.activity_id.toString(),
				segment_effort_id: effort.segment_effort_id,
				elapsed_time: effort.time,
				average_power: effort.power,
			});
		}
	}

	return {
		title,
		club,
		segmentsInOrder: segmentsInOrder.map((val) => val.toString()),
		route,
		segments,
	} as RideEfforts;
}

export function resultsHandler(request: Request, response: Response) {
	var name = request.params.name;
	if (name === undefined) {
		console.log(`No name`);
		response.sendStatus(400);
		return;
	}
	name = name!.toString();
	if (!name.endsWith('.json')) {
		response.sendStatus(404);
		return;
	}
	name = name.substring(0, name.length - '.json'.length);
	let egan = findEganByName(name);
	if (egan == null) {
		response.sendStatus(404);
		return;
	}

	const results = computeResults(egan);
	// response.json(computeResults(egan));
	response.send(`results: ${results}`);
}

export function storeResult(activity: ProcessedActivity, name: string) {
	pushToMapEntry(resultsByName, name, activity);
}

export function deleteAllResults(_athleteId: number) {
	// TODO
}

export function deleteResults(_activityId: number, _athleteId: number) {
	// TODO
}
