import localforage from "localforage";
import sortBy from "sort-by";

const baseUri = "/api/v1";
const host = import.meta.env.DEV 
    ? "http://localhost:3000"
    : "";

// ============================================================================
// Authentication Functions
// ============================================================================

export async function login(groupSlug, password) {
  const res = await fetch(`${host}${baseUri}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ groupSlug, password }),
  });

  assureResponse(res);
  return await res.json();
}

export async function switchContact(contactId) {
  const res = await fetch(`${host}${baseUri}/auth/switch-contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ contactId }),
  });

  assureResponse(res);
  return await res.json();
}

export async function verifyToken(token) {
  const res = await fetch(`${host}${baseUri}/auth/verify-token/${token}`, {
    method: "GET",
    credentials: "include",
  });

  assureResponse(res);
  return await res.json();
}

export async function logout() {
  const res = await fetch(`${host}${baseUri}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  assureResponse(res);
  return await res.json();
}

export async function getCurrentUser() {
  const res = await fetch(`${host}${baseUri}/auth/me`, {
    credentials: "include",
  });

  assureResponse(res);
  return await res.json();
}

// ============================================================================
// Group Functions
// ============================================================================

export async function getGroup(groupSlug) {
  const res = await fetch(`${host}${baseUri}/groups/${groupSlug}`, {
    credentials: "include",
  });

  assureResponse(res);
  return await res.json();
}

export async function createGroup(data) {
  const res = await fetch(`${host}${baseUri}/groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  assureResponse(res);
  return await res.json();
}

export async function updateGroup(groupSlug, updates) {
  const res = await fetch(`${host}${baseUri}/groups/${groupSlug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });

  assureResponse(res);
  return await res.json();
}

export async function getGroups() {
  return await get("groups");
}

export async function sendInvite(groupSlug, email) {
  const res = await fetch(`${host}${baseUri}/groups/${groupSlug}/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  assureResponse(res);
  return await res.json();
}

export async function getGroupStatistics(groupSlug) {
  const res = await fetch(`${host}${baseUri}/groups/${groupSlug}/statistics`, {
    credentials: "include",
  });

  assureResponse(res);
  return await res.json();
}

// ============================================================================
// Contact Functions
// ============================================================================

export async function getContacts(groupSlug) {
  const res = await fetch(`${host}${baseUri}/groups/${groupSlug}/contacts`, {
    credentials: "include",
  });

  assureResponse(res);
  return await res.json();
}

export async function createContact(groupSlug, contact) {
  return await create("contact", `/groups/${groupSlug}/contacts`, contact);
}

export async function getContact(id) {
  return await getOne("contact", id);
}

export async function updateContact(id, groupSlug, updates) {
  return await update("contact", id, `/groups/${groupSlug}/contacts/${id}`, updates);
}

export async function deleteContact(id, groupSlug) {
  return await deleteItem(`/groups/${groupSlug}/contacts/${id}`);
}

// ============================================================================
// Competition Functions
// ============================================================================

export async function getCompetitions(groupSlug) {
  const res = await fetch(`${host}${baseUri}/groups/${groupSlug}/competitions`, {
    credentials: "include",
  });

  assureResponse(res);
  return await res.json();
}

export async function getCompetition(groupSlug, competitionId) {
    const res = await fetch(`${host}${baseUri}/groups/${groupSlug}/competitions/${competitionId}`, {
    credentials: "include",
  });

  assureResponse(res);
  return await res.json();
}

export async function createCompetition(groupSlug) {
  return await create("competitions", `/groups/${groupSlug}/competitions`);
}

export async function updateCompetition(id, groupSlug, updates) {
  return await update("competitions", id, `/groups/${groupSlug}/competitions/${id}`, updates);
}

export async function deleteCompetition(id) {
  if (await deleteItem("competitions", id)) {
    let activities = (await get("activities")).filter(activity => activity.competitionId === id);
    for (let i = 0; i < activities.length; i++) {
      await deleteActivity(activities[i]._id);
    }

    let competitions = await get("competitions");
    const index = competitions.findIndex(c => c._id === id);
    competitions.splice(index, 1);
    await set("competitions", competitions);
    return true;
  }

  return false;
}

export async function getCompetitionStatistics(groupSlug, competitionId) {
  const res = await fetch(`${host}${baseUri}/groups/${groupSlug}/competitions/${competitionId}/statistics`, {
    credentials: "include",
  });

  assureResponse(res);
  return await res.json();
}

// ============================================================================
// Activity Functions (renamed from Event)
// ============================================================================

export async function getActivities(groupSlug, competitionId) {
  const res = await fetch(`${host}${baseUri}/groups/${groupSlug}/competitions/${competitionId}/activities`, {
    credentials: "include",
  });

  assureResponse(res);
  return await res.json();
}

export async function getActivity(groupSlug, competitionId, activityId) {
  const res = await fetch(`${host}${baseUri}/groups/${groupSlug}/competitions/${competitionId}/activities/${activityId}`, {
    credentials: "include",
  });

  assureResponse(res);
  return await res.json();
}

export async function createActivity(params) {
  return await create("activities", `/groups/${params.groupSlug}/competitions/${params.competitionId}/activities`);
}

export async function updateActivity(params, updates) {
  return await update("activities", params.activityId, `/groups/${params.groupSlug}/competitions/${params.competitionId}/activities/${params.activityId}`, updates);
}

export async function deleteActivity(id) {
  return await deleteItem("activities", id);
}

// Backward compatibility aliases
export const getEvents = getActivities;
export const getEvent = getActivity;
export const createEvent = createActivity;
export const updateEvent = updateActivity;
export const deleteEvent = deleteActivity;

// ============================================================================
// Score/Result Functions
// ============================================================================

export async function getScores(groupSlug, competitionId, activityId) {
  const res = await fetch(`${host}${baseUri}/groups/${groupSlug}/competitions/${competitionId}/activities/${activityId}/scores`, {
    credentials: "include",
  });

  assureResponse(res);
  return await res.json();
}

export async function getScore(groupSlug, competitionId, activityId, scoreId) {
  const res = await fetch(`${host}${baseUri}/groups/${groupSlug}/competitions/${competitionId}/activities/${activityId}/scores/${scoreId}`, {
    credentials: "include",
  });

  assureResponse(res);
  return await res.json();
}

export async function createScore(params, data) {
  return await create("score", `/groups/${params.groupSlug}/competitions/${params.competitionId}/activities/${params.activityId}/scores`, data);
}

export async function updateScore(params, updates) {
  return await update("score", params.scoreId, `/groups/${params.groupSlug}/competitions/${params.competitionId}/activities/${params.activityId}/scores/${params.scoreId}`, updates);
}

export async function deleteScore(id) {
  return await deleteItem("score", id);
}

// ============================================================================
// Helper Functions
// ============================================================================

async function getOne(key, id) {
  return (await get(key))
    .find(item => item._id === id);
}

async function get(key) {
  const result = await localforage.getItem(key) ?? [];
  let items = Array.isArray(result)
    ? result
    : [result];

  if (!items) {
    items = [];
  }

  return items.sort(sortBy("createdAt"));
}

export async function synchronize(key, uri) {
  const res = await fetch(`${host}${uri}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  assureResponse(res);

  const items = await res.json();
  set(key, items);
}

async function create(key, uri, extra) {
  const res = await fetch(`${host}${baseUri}${uri}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(extra ?? {})
  });

  assureResponse(res);

  const newItem = await res.json();
  let items = await get(key) ?? [];
  items.unshift(newItem);
  await set(key, items);
  return newItem;
}

async function update(key, id, uri, updates) {
  const items = await get(key);
  let item = items.find(item => item._id === id);
  if (!item) {
    throw new Error(`No ${key} item found for ${id}`);
  }

  const res = await fetch(`${host}${baseUri}${uri}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(updates)
  });

  assureResponse(res);

  Object.assign(item, updates);
  set(key, items);

  return item;
}

async function deleteItem(uri) {
  const res = await fetch(`${host}${baseUri}${uri}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  assureResponse(res);
  return true;
}

async function set(key, data) {
  return await localforage.setItem(key, data);
}

function assureResponse(res) {
  if (res.status >= 200 && res.status <= 299) {
    return;
  }

  throw new Error(`Unexpected status code detected: ${res.status}`);
}
