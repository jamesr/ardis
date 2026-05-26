import type { SummaryAthlete } from "strava-sdk";
import { strava } from "./strava.js";
import type { Request, Response } from 'express';
import { allEgans } from "./egan.js";

var athletes = new Map<number, SummaryAthlete>();

export async function registerAthlete(athleteId: number) {
  const athlete = await strava.getAthlete(athleteId.toString());
  if (athlete === undefined) {
    return;
  }
  athletes.set(athleteId, athlete);
}

export function getAthleteById(athleteId: number) {
  return athletes.get(athleteId);
}

export async function athletesHandler(req: Request, res: Response) {
  if (!req.params['athleteId']) {
    res.sendStatus(404);
    return;
  }
  const athleteId = parseInt(req.params['athleteId'] as string);
  const athlete = athletes.get(athleteId);
  if (athlete === undefined) {
    res.sendStatus(404);
    return;
  }
  var response = `<html><title>Egan athlete ${athlete.firstname!} ${athlete.lastname!}</title>`;
  response += `<body>Welcome, ${athlete.firstname!} ${athlete.lastname!}`;

  // TODO: Link to all Egan results containing this athlete.
}