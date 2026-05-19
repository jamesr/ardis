import { findEganByName, type Egan } from './egan.js';
import { type Request, type Response } from 'express';
import type { Club, RideEfforts } from './results-types.js';
import { strava } from './strava.js';
import type { ProcessedActivity } from './activity.js';

var results = new Map<string, Array<ProcessedActivity>>();

function computeResults(egan: Egan): RideEfforts {
	const title = egan.title;

	const club = {
		id: 469663,
		name: 'Egan',
		url: 'https://altovelo.org/egan',
	} as Club;

	const segmentIds = new Array(egan.segments.values);
	const segmentsInOrder = segmentIds.map((val) => val.toString()).toSorted();
	const segments = {};

	const route = strava.getRouteById(egan.route);

	for (const activity of results.get(egan.name) ?? []) {
		// TODO: Look up athlete's info by id
		for (const effort of activity.efforts) {
			const time = effort.time;
			const power = effort.power;
			const pr_rank = effort.pr_rank;
			const kom_rank = effort.kom_rank;
		}
	}

	return {
		title,
		club,
		segmentsInOrder,
		route,
		segments,
	} as RideEfforts;
}

export function resultsHandler(request: Request, response: Response) {
	var name = request.params.name;
	if (typeof name != 'string') {
		response.sendStatus(400);
		return;
	}
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

	response.json(computeResults(egan));
}

export function storeResult(activity: ProcessedActivity, name: string) {
	results.getOrInsert(name, []).push(activity);
}

export function deleteAllResults(athleteId: number) {
	// TODO
}

export function deleteResults(activityId: number, athleteId: number) {
	// TODO
}
