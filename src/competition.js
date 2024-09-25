import localforage from "localforage";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

export async function getEvents(query, competitionId) {
  await fakeNetwork(`getEvents:${query}`);
  let events = await localforage.getItem("events");
  if (!events) {
    events = [];
  }
  // events = events.filter(event => event.competitionId === competitionId);
  if (query) {
    events = matchSorter(events, query, { keys: ["name"] });
  }
  return events.sort(sortBy("last", "createdAt"));
}

export async function getEvent(id) {
  console.log(id);
  
  await fakeNetwork(`event:${id}`);
  let events = await localforage.getItem("events");
  let event = events.find(event => event.id === id);
  return event ?? null;
}

export async function createEvent(competitionId) {
  await fakeNetwork();
  let id = Math.random().toString(36).substring(2, 9);
  let event = { id, competitionId, createdAt: Date.now() };
  let events = await getEvents();
  events.unshift(event);
  await set("events", events);
  return event;
}

export async function updateEvent(id, updates) {
  await fakeNetwork();
  let events = await localforage.getItem("events");
  let event = events.find(event => event.id === id);
  if (!event) throw new Error("No event found for", id);
  Object.assign(event, updates);
  await set("events", events);
  return event;
}

export async function deleteEvent(id) {
  let events = await localforage.getItem("events");
  let index = events.findIndex(event => event.id === id);
  if (index > -1) {
    events.splice(index, 1);
    await set("events", events);
    return true;
  }
  return false;
}

export async function getCompetitions(query) {
  await fakeNetwork(`getCompetitions:${query}`);
  let events = await localforage.getItem("competitions");
  if (!events) events = [];
  if (query) {
    events = matchSorter(events, query, { keys: ["name"] });
  }
  return events.sort(sortBy("last", "createdAt"));
}

export async function getCompetition(id) {
  await fakeNetwork(`competition:${id}`);
  let competitions = await localforage.getItem("competitions");
  let competition = competitions.find(contact => contact.id === id);
  return competition ?? null;
}

export async function createCompetition() {
  await fakeNetwork();
  let id = Math.random().toString(36).substring(2, 9);
  let competition = { id, createdAt: Date.now() };
  let competitions = await getCompetitions();
  competitions.unshift(competition);
  await set("competitions", competitions);
  return competition;
}

export async function updateCompetition(id, updates) {
  await fakeNetwork();
  let competitions = await localforage.getItem("competitions");
  let competition = competitions.find(competition => competition.id === id);
  if (!competition) throw new Error("No competition found for", id);
  Object.assign(competition, updates);
  await set("competitions", competitions);
  return competition;
}

export async function deleteCompetition(id) {
  let competitions = await localforage.getItem("competitions");
  let index = competitions.findIndex(competition => competition.id === id);
  if (index > -1) {
    let events = await getEvents().filter(event => event.competitionId === id);
    for (let i = 0; i < events.length; i++) {
      await deleteEvent(events[i].id);
    }

    competitions.splice(index, 1);
    await set("competitions", competitions);
    return true;
  }
  return false;
}

function set(key, data) {
  console.log(key, data);
  return localforage.setItem(key, data);
}

// fake a cache so we don't slow down stuff we've already seen
let fakeCache = {};

async function fakeNetwork(key) {
  if (!key) {
    fakeCache = {};
  }

  if (fakeCache[key]) {
    return;
  }

  fakeCache[key] = true;
  return new Promise(res => {
    setTimeout(res, Math.random());
  });
}