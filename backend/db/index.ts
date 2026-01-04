import { MongoClient, Db, ObjectId } from "mongodb";
import {
    Competition,
    Contact,
    Group,
    Activity,
    Event as EventModel,
    Score
} from "../models";

var _client: MongoClient | null;

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/?retryWrites=true";

async function getClient(): Promise<MongoClient> {
    if (_client == null) {
        _client = new MongoClient(uri);
        await _client.connect();
        configure(_client);
        console.log("Opening database connection");
        return _client;
    }

    return _client;
}

async function exec<T>(func: (db: Db) => Promise<T | null>): Promise<T | null> {
    const client = await getClient();
    try {
        return await func(client.db("batalj"));
    }
    catch (e) {
        throw e;
    }
}

export async function dispose(): Promise<void> {
    if (_client == null) {
        return;
    }

    console.log("Closing database connection");
    await _client.close();
    _client = null;
}

export async function getContacts(groupId: ObjectId): Promise<Contact[]> {
    return await exec(async db => {
        const results = await db.collection("contacts").find({ groupId: groupId }).toArray();
        return results.map(c => {
            return c as Contact;
        });
    }) ?? [];
}

export async function getContactById(contactId: string): Promise<Contact | null> {
    return await exec(async db => {
        if (contactId.length != 24) {
            return null;
        }

        const results = await db.collection("contacts").findOne({ _id: new ObjectId(contactId) });
        return results as Contact;
    });
}

export async function updateContact(id: string, updates: any): Promise<Boolean> {
    return await exec(async db => {
        if (id.length != 24) {
            return false;
        }
        console.log("Updating contact", id, updates);
        const result = await db.collection("contacts")
            .updateOne(
                { _id: new ObjectId(id) },
                { $set: updates });

        if (!result.acknowledged) {
            throw Error(`Failed to update contact. The write operation was not acknowledged`);
        }

        if (result.matchedCount > 1 || result.modifiedCount > 1) {
            throw Error(`Failed to update contact. Wrong matched or modified count`);
        }

        return result.matchedCount == 1 && result.modifiedCount == 1;
    }) ?? false;
}

export async function createContact(contact: Contact): Promise<Contact | null> {
    const newContact = await exec(async db => {
        const result = await db.collection("contacts").insertOne(contact);
        if (!result.acknowledged) {
            throw Error(`Failed to insert contact. The write operation was not acknowledged`);
        }

        contact._id = result.insertedId;
        return contact;
    });

    return newContact;
}

export async function deleteContact(contactId: string): Promise<void> {
    await exec(async db => {
        if (contactId.length != 24) {
            return null;
        }

        const result = await db.collection("contacts").deleteOne({ _id: new ObjectId(contactId) });
        if (!result.acknowledged) {
            throw Error(`Failed to delete contact. The write operation was not acknowledged`);
        }
    });
}

export async function getEventScores(eventId: string): Promise<Score[]> {
    return await exec(async db => {
        const results = await db.collection("scores")
            .find({ eventId: new ObjectId(eventId) }).toArray();

        return results.map(c => {
            return c as Score;
        });
    }) ?? [];
}

export async function updateScore(id: string, updates: any): Promise<Boolean> {
    return await exec(async db => {
        if (id.length != 24) {
            return false;
        }

        const result = await db.collection("scores")
            .updateOne(
                { _id: new ObjectId(id) },
                { $set: updates });

        if (!result.acknowledged) {
            throw Error(`Failed to update score. The write operation was not acknowledged`);
        }

        if (result.matchedCount > 1 || result.modifiedCount > 1) {
            throw Error(`Failed to update score. Wrong matched or modified count`);
        }

        return result.matchedCount == 1 && result.modifiedCount == 1;
    }) ?? false;
}

export async function createScore(value: Score): Promise<Score | null> {
    const newValue = await exec(async db => {
        const result = await db.collection("scores").insertOne(value);
        if (!result.acknowledged) {
            throw Error(`Failed to insert score. The write operation was not acknowledged`);
        }

        value._id = result.insertedId;
        return value;
    });

    return newValue;
}

export async function deleteScore(id: string): Promise<void> {
    await exec(async db => {
        if (id.length != 24) {
            return null;
        }

        const result = await db.collection("scores").deleteOne({ _id: new ObjectId(id) });
        if (!result.acknowledged) {
            throw Error(`Failed to delete score. The write operation was not acknowledged`);
        }
    });
}

export async function getCompetitions(groupId: string): Promise<Competition[]> {
    return await exec(async db => {
        const results = await db.collection("competitions").find({ groupId: new ObjectId(groupId) }).toArray();
        return results.map(c => {
            return c as Competition;
        });
    }) ?? [];
}

export async function getCompetitionById(competitionId: string): Promise<Competition | null> {
    return await exec(async db => {
        if (competitionId.length != 24) {
            return null;
        }

        const results = await db.collection("competitions").findOne({ _id: new ObjectId(competitionId) });
        return results as Competition;
    });
}

export async function updateCompetition(id: string, updates: any): Promise<Boolean> {
    return await exec(async db => {
        if (id.length != 24) {
            return false;
        }

        const result = await db.collection("competitions")
            .updateOne(
                { _id: new ObjectId(id) },
                { $set: updates });

        if (!result.acknowledged) {
            throw Error(`Failed to update competition. The write operation was not acknowledged`);
        }

        if (result.matchedCount > 1 || result.modifiedCount > 1) {
            throw Error(`Failed to update competition. Wrong matched or modified count`);
        }

        return result.matchedCount == 1 && result.modifiedCount == 1;
    }) ?? false;
}

export async function createCompetition(competition: Competition): Promise<Competition | null> {
    const newCompetition = await exec(async db => {
        const result = await db.collection("competitions").insertOne(competition);
        if (!result.acknowledged) {
            throw Error(`Failed to insert competition. The write operation was not acknowledged`);
        }

        competition._id = result.insertedId;
        return competition;
    });

    return newCompetition;
}

export async function deleteCompetition(competitionId: string): Promise<void> {
    await exec(async db => {
        if (competitionId.length != 24) {
            return null;
        }

        const result = await db.collection("competitions").deleteOne({ _id: new ObjectId(competitionId) });
        if (!result.acknowledged) {
            throw Error(`Failed to delete competition. The write operation was not acknowledged`);
        }
    });
}

export async function getEvents(competitionId: string): Promise<EventModel[]> {
    return await exec(async db => {
        const results = await db.collection("events").find({ competitionId: new ObjectId(competitionId) }).toArray();
        return results.map(c => {
            return c as EventModel;
        });
    }) ?? [];
}

export async function getEventById(eventId: string): Promise<EventModel | null> {
    return await exec(async db => {
        if (eventId.length != 24) {
            return null;
        }

        const results = await db.collection("events").findOne({ _id: new ObjectId(eventId) });
        return results as EventModel;
    });
}

export async function updateEvent(id: string, updates: any): Promise<Boolean> {
    return await exec(async db => {
        if (id.length != 24) {
            return false;
        }

        const result = await db.collection("events")
            .updateOne(
                { _id: new ObjectId(id) },
                { $set: updates });

        if (!result.acknowledged) {
            throw Error(`Failed to update event. The write operation was not acknowledged`);
        }

        if (result.matchedCount > 1 || result.modifiedCount > 1) {
            throw Error(`Failed to update event. Wrong matched or modified count`);
        }

        return result.matchedCount == 1 && result.modifiedCount == 1;
    }) ?? false;
}

export async function createEvent(event: EventModel): Promise<EventModel | null> {
    const newEvent = await exec(async db => {
        const result = await db.collection("events").insertOne(event);
        if (!result.acknowledged) {
            throw Error(`Failed to insert event. The write operation was not acknowledged`);
        }

        event._id = result.insertedId;
        return event;
    });

    return newEvent;
}

export async function deleteEvent(eventId: string): Promise<void> {
    await exec(async db => {
        if (eventId.length != 24) {
            return null;
        }

        const result = await db.collection("events").deleteOne({ _id: new ObjectId(eventId) });
        if (!result.acknowledged) {
            throw Error(`Failed to delete event. The write operation was not acknowledged`);
        }
    });
}

// Activity aliases (new naming convention)
export const getActivities = getEvents;
export const getActivityById = getEventById;
export const updateActivity = updateEvent;
export const createActivity = createEvent;
export const deleteActivity = deleteEvent;
export const getActivityResults = getEventScores;

export async function getGroupById(groupId: string): Promise<Group | null> {
    return await exec(async db => {
        if (groupId.length != 24) {
            return null;
        }

        const results = await db.collection("groups").findOne({ _id: new ObjectId(groupId) });
        return results as Group;
    });
}

export async function updateGroup(id: string, updates: any): Promise<Boolean> {
    return await exec(async db => {
        if (id.length != 24) {
            return false;
        }

        const result = await db.collection("groups")
            .updateOne(
                { _id: new ObjectId(id) },
                { $set: updates });

        if (!result.acknowledged) {
            throw Error(`Failed to update group. The write operation was not acknowledged`);
        }

        if (result.matchedCount > 1 || result.modifiedCount > 1) {
            throw Error(`Failed to update group. Wrong matched or modified count`);
        }

        return result.matchedCount == 1 && result.modifiedCount == 1;
    }) ?? false;
}

export async function createGroup(group: Group): Promise<Group | null> {
    const newGroup = await exec(async db => {
        const result = await db.collection("groups").insertOne(group);
        if (!result.acknowledged) {
            throw Error(`Failed to insert group. The write operation was not acknowledged`);
        }

        group._id = result.insertedId;
        return group;
    });

    return newGroup;
}

export async function deleteGroup(groupId: string): Promise<void> {
    await exec(async db => {
        if (groupId.length != 24) {
            return;
        }

        const result = await db.collection("groups").deleteOne({ _id: new ObjectId(groupId) });
        if (!result.acknowledged) {
            throw Error(`Failed to delete group. The write operation was not acknowledged`);
        }
    });
}

// Slug management functions
export async function getGroupBySlug(slug: string): Promise<Group | null> {
    return await exec(async db => {
        const result = await db.collection("groups").findOne({ slug: slug });
        return result as Group;
    });
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
    const existing = await getGroupBySlug(slug);
    return existing === null;
}

export function makeSlug(baseSlug: string): string {
    return baseSlug
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[åä]/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/[^a-z0-9-]/g, '');
}

export async function generateUniqueSlug(baseSlug: string): Promise<string> {
    // Normalize slug: lowercase, replace spaces with hyphens, remove special chars
    let slug = makeSlug(baseSlug);

    if (await isSlugAvailable(slug)) {
        return slug;
    }

    // Slug taken, add incrementing number
    let counter = 2;
    while (true) {
        const newSlug = `${slug}${counter}`;
        if (await isSlugAvailable(newSlug)) {
            return newSlug;
        }
        counter++;
    }
}

// Invite token functions
export async function addInviteToken(groupId: string, token: string, email: string): Promise<boolean> {
    return await exec(async db => {
        if (groupId.length != 24) {
            return false;
        }

        const result = await db.collection("groups").updateOne(
            { _id: new ObjectId(groupId) },
            {
                $push: {
                    inviteTokens: {
                        token,
                        email,
                        createdAt: new Date()
                    }
                } as any
            }
        );

        return result.acknowledged && result.modifiedCount === 1;
    }) ?? false;
}

export async function getInviteToken(token: string): Promise<{ group: Group; email: string } | null> {
    return await exec(async db => {
        const result = await db.collection("groups").findOne({
            "inviteTokens.token": token,
            "inviteTokens.usedAt": { $exists: false }
        });

        if (!result) {
            return null;
        }

        const group = result as Group;
        const inviteToken = group.inviteTokens?.find(t => t.token === token);

        if (!inviteToken) {
            return null;
        }

        return { group, email: inviteToken.email };
    });
}

export async function markInviteTokenUsed(token: string): Promise<boolean> {
    return await exec(async db => {
        const result = await db.collection("groups").updateOne(
            { "inviteTokens.token": token },
            { $set: { "inviteTokens.$.usedAt": new Date() } }
        );

        return result.acknowledged && result.modifiedCount === 1;
    }) ?? false;
}

// Statistics interfaces and functions
export interface ActivityResult {
    activityId: ObjectId;
    activityName: string;
    placement: number;
    points: number;
    resultValue: number;
}

export interface ContactStatistics {
    contactId: ObjectId;
    contactName: string;
    totalPoints: number;
    activityResults: ActivityResult[];
}

function getPointsForPlacement(placement: number): number {
    const pointsMap: { [key: number]: number } = {
        1: 10,
        2: 7,
        3: 5,
        4: 3,
        5: 1
    };
    return pointsMap[placement] || 0;
}

export async function getCompetitionStatistics(competitionId: string): Promise<ContactStatistics[]> {
    return await exec(async db => {
        if (competitionId.length != 24) {
            return [];
        }

        // Get all activities for this competition
        const activities = await db.collection("events")
            .find({ competitionId: new ObjectId(competitionId) })
            .toArray();

        const contactStatsMap = new Map<string, ContactStatistics>();

        // Process each activity
        for (const activity of activities) {
            const results = await db.collection("scores")
                .find({ eventId: activity._id })
                .toArray();

            if (results.length === 0) continue;

            // Calculate result values based on activity type
            const resultsWithValues = results.map((r: any) => {
                let value = r.result;
                if (activity.activityType === 'TIME_MATCHING' && r.time1 && r.time2) {
                    value = Math.abs(r.time1 - r.time2);
                }
                return { ...r, calculatedValue: value };
            });

            // Sort based on activity type
            const isLowerBetter = activity.activityType === 'TIME_SHORT_BETTER' ||
                activity.activityType === 'POINTS_LOW_BETTER' ||
                activity.activityType === 'TIME_MATCHING';

            resultsWithValues.sort((a, b) => {
                return isLowerBetter ?
                    a.calculatedValue - b.calculatedValue :
                    b.calculatedValue - a.calculatedValue;
            });

            // Assign placements (handle ties)
            let currentPlacement = 1;
            for (let i = 0; i < resultsWithValues.length; i++) {
                const result = resultsWithValues[i];

                // Check if this is a tie with previous result
                if (i > 0 && result.calculatedValue === resultsWithValues[i - 1].calculatedValue) {
                    // Same placement as previous
                    (result as any).placement = (resultsWithValues[i - 1] as any).placement;
                } else {
                    (result as any).placement = currentPlacement;
                }

                currentPlacement = i + 2; // Next placement accounts for ties
            }

            // Award points and aggregate
            for (const result of resultsWithValues) {
                const contactId = result.contactId.toString();
                const points = getPointsForPlacement((result as any).placement);

                if (!contactStatsMap.has(contactId)) {
                    // Get contact name
                    const contact = await db.collection("contacts").findOne({ _id: result.contactId });
                    contactStatsMap.set(contactId, {
                        contactId: result.contactId,
                        contactName: contact ? `${contact.first} ${contact.last}` : 'Unknown',
                        totalPoints: 0,
                        activityResults: []
                    });
                }

                const stats = contactStatsMap.get(contactId)!;
                stats.totalPoints += points;
                stats.activityResults.push({
                    activityId: activity._id,
                    activityName: activity.name,
                    placement: (result as any).placement,
                    points,
                    resultValue: result.calculatedValue
                });
            }
        }

        return Array.from(contactStatsMap.values());
    }) ?? [];
}

export async function getGroupStatistics(groupId: string): Promise<ContactStatistics[]> {
    return await exec(async db => {
        if (groupId.length != 24) {
            return [];
        }

        // Get all competitions for this group
        const competitions = await db.collection("competitions")
            .find({ groupId: new ObjectId(groupId) })
            .toArray();

        const contactStatsMap = new Map<string, ContactStatistics>();

        // Aggregate statistics from all competitions
        for (const competition of competitions) {
            const compStats = await getCompetitionStatistics(competition._id.toString());

            for (const stats of compStats) {
                const contactId = stats.contactId.toString();

                if (!contactStatsMap.has(contactId)) {
                    contactStatsMap.set(contactId, {
                        contactId: stats.contactId,
                        contactName: stats.contactName,
                        totalPoints: 0,
                        activityResults: []
                    });
                }

                const aggregated = contactStatsMap.get(contactId)!;
                aggregated.totalPoints += stats.totalPoints;
                aggregated.activityResults.push(...stats.activityResults);
            }
        }

        return Array.from(contactStatsMap.values());
    }) ?? [];
}

async function configure(_client: MongoClient) {
    const db = _client.db("batalj");
    const collections = (await db.collections())
        .map(c => c.collectionName);

    if (!collections.includes("competitions")) {
        await db.createCollection("competitions");
    }
    if (!collections.includes("contacts")) {
        await db.createCollection("contacts");
    }
    if (!collections.includes("groups")) {
        await db.createCollection("groups");
    }
    if (!collections.includes("events")) {
        await db.createCollection("events");
    }
    if (!collections.includes("scores")) {
        await db.createCollection("scores");
    }

    // Create indexes for new fields
    await db.collection("groups").createIndex({ slug: 1 }, { unique: true });
    await db.collection("groups").createIndex({ "inviteTokens.token": 1 });
}
