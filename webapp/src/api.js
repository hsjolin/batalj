import localforage from "localforage";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

const baseUri = "http://localhost:3000/api/v1";

export async function getEvents(competitionId) {
  return (await get("events"))
    .filter(event => event.competitionId === competitionId);
}

export async function getEvent(id) {
  return await getOne("events", id);
}

export async function createEvent(competitionId) {
  return await create("events", { competitionId });
}

export async function updateEvent(params, updates) {
  return await update("events", params.eventId, `/groups/${params.groupId}/competitions/${params.competitionId}/events/${params.eventId}`, updates);
}

export async function deleteEvent(id) {
  return await deleteItem("events", id);
}

export async function getCompetitions(groupId) {
  return (await get("competitions"))
    .filter(competition => competition.groupId === groupId);
}

export async function getCompetition(id) {
  return await getOne("competitions", id);
}

export async function createCompetition(groupId) {
  return await create("competitions", { groupId });
}

export async function updateCompetition(id, updates) {
  return await update("competitions", id, `/groups/${groupId}/competitions/${id}`, updates);
}

export async function deleteCompetition(id) {
  if (await deleteItem("competitions", id)) {
    let events = await getEvents().filter(event => event.competitionId === id);
    for (let i = 0; i < events.length; i++) {
      await deleteEvent(events[i]._id);
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
  return await create("groups", "/groups");
}

export async function updateGroup(id, updates) {
  return await update("groups", id, `/groups/${id}`, updates);
}

export async function getGroups() {
  return await get("groups");
}

export async function getContacts(groupId) {
  return (await get("contacts"))
    .filter(contact => contact.groupId === groupId);
}

export async function createContact(groupId) {
  return await create("contacts", `/groups/${groupId}/contacts`);
}

export async function getContact(id) {
  return await getOne("contacts", id);
}

export async function updateContact(id, groupId, updates) {
  return await update("contacts", id, `/groups/${groupId}/contacts/${id}`, updates);
}

export async function deleteContact(id, groupId) {
  return await deleteItem(`/groups/${groupId}/contacts/${id}`);
}

async function getOne(key, id) {
  return (await get(key))
    .find(item => item._id === id);
}

async function get(key) {
  let items = await localforage.getItem(key);

  if (!items) {
    items = [];
  }

  return items.sort(sortBy("createdAt"));
}

export async function synchronize(key, uri) {
  console.log("Synchronizing", key, uri);

  const res = await fetch(`${baseUri}${uri}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });

  assureResponse(res);

  const items = await res.json();
  set(key, items)
}

async function create(key, uri, extra) {
  const res = await fetch(`${baseUri}${uri}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(extra ?? {})
  });

  assureResponse(res);

  const newItem = await res.json();
  let items = await localforage.getItem(key) ?? [];
  items.unshift(newItem);
  await set(key, items);
  return newItem;
}

async function update(key, id, uri, updates) {
  const items = await localforage.getItem(key);
  let item = items.find(item => item._id === id);
  if (!item) {
    throw new Error(`No ${key} item found for ${id}`);
  }

  const res = await fetch(`${baseUri}${uri}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates)
  });

  assureResponse(res);

  Object.assign(item, updates);
  set(key, items);

  return item;
}

async function deleteItem(uri) {
  const res = await fetch(`${baseUri}${uri}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    }
  });

  assureResponse(res);
  return true;
}

async function set(key, data) {
  console.log(key, data);
  return await localforage.setItem(key, data);
}

function assureResponse(res) {
  if (res.status >= 200 && res.status <= 299) {
    return;
  }

  throw new Error(`Unexpected status code detected: ${res.status}`);
}
