import localforage from "localforage";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

export async function getEvents(competitionId, query) {
  return (await get("events", query, ["name"]))
    .filter(event => event.competitionId === competitionId);
}

export async function getEvent(id) {
  return await getOne("events", id);
}   

export async function createEvent(competitionId) {
  return await create("events", { competitionId });
}

export async function updateEvent(id, updates) {
  return await update("events", id, updates);
}

export async function deleteEvent(id) {
  return await deleteItem("events", id);
}

export async function getCompetitions(groupId, query) {
  return (await get("competitions", query))
    .filter(competition => competition.groupId === groupId);
}

export async function getCompetition(id) {
  return await getOne("competitions", id);
}

export async function createCompetition(groupId) {
  return await create("competitions", { groupId });
}

export async function updateCompetition(id, updates) {
  return await update("competitions", id, updates);
}

export async function deleteCompetition(id) {
if (await deleteItem("competitions", id)) {
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

export async function getGroup(id) {
  return await getOne("groups", id);
}

export async function createGroup() {
  return await create("groups");
}

export async function updateGroup(id, updates) {
  return await update("groups", id, updates);
}

export async function getGroups() {
  return await get("groups");
}

export async function getContacts(groupId, query) {
  return (await get("contacts", query, ["first", "last"]))
    .filter(contact => contact.groupId === groupId);
}

export async function createContact(groupId) {
  return await create("contacts", { groupId });
}

export async function getContact(id) {
  return await getOne("contacts", id);
}

export async function updateContact(id, updates) {
  return await update("contacts", id, updates);
} 

export async function deleteContact(id) {
  return await deleteItem("contacts", id);
} 

async function getOne(key, id) {
  return (await get(key))
    .find(item => item.id === id);
}

async function get(key, query, keys) {
  let items = await localforage.getItem(key);
  if (query && keys) {
    events = matchSorter(items, query, { keys });
  }
  
  if (!items) {
    items = [];
  }

  return items.sort(sortBy("createdAt"));
}

async function create(key, extra) {
  let id = Math.random().toString(36).substring(2, 9);
  let item = { id, createdAt: Date.now() };
  Object.assign(item, extra);
  let items = await localforage.getItem(key) ?? []; 
  items.unshift(item);
  await set(key, items);
  return item;
}

async function update(key, id, updates) {
  let items = await localforage.getItem(key);
  let item = items.find(item => item.id === id);
  if (!item) throw new Error(`No ${key} item found for ${id}`);
  Object.assign(item, updates);
  await set(key, items);
  return item;
}

async function deleteItem(key, id) {
  let items = await localforage.getItem(key);
  let index = items.findIndex(item => item.id === id);
  if (index > -1) {
    items.splice(index, 1);
    await set(key, items);
    return true;
  }
  return false;
}

async function set(key, data) { 
  console.log(key, data);
  return await localforage.setItem(key, data);
}