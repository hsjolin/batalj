import { MongoClient, Db, ObjectId } from "mongodb";
import {
    Competition,
    Contact,
    Group,
    Event as EventModel,
    Score
} from "../models";

var _client: MongoClient | null;
var _dataUpdatedListener = (c: DataUpdatedContext) => { };

const uri = "mongodb://localhost:27017/?retryWrites=true";

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

export function setDataUpdatedListener(listener: (context: DataUpdatedContext) => void) {
    _dataUpdatedListener = listener;
}

export interface DataUpdatedContext {
    type: UpdatedType,
    groupId: string
}

export type UpdatedType =
    "competition" |
    "contact" |
    "event" |
    "group" |
    "score";

export async function dispose(): Promise<void> {
    if (_client == null) {
        return;
    }

    console.log("Closing database connection");
    await _client.close();
    _client = null;
}

export async function getContacts(groupId: string): Promise<Contact[]> {
    return await exec(async db => {
        const results = await db.collection("contacts").find({ groupId: new ObjectId(groupId) }).toArray();
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

        const updated = result.matchedCount == 1 && result.modifiedCount == 1;
        if (updated) {
            _dataUpdatedListener({
                groupId: "TBD",
                type: "contact"
            });
        }

        return updated;
    }) ?? false;
}

export async function createContact(contact: Contact): Promise<Contact | null> {
    const newContact = await exec(async db => {
        const result = await db.collection("contacts").insertOne(contact);
        if (!result.acknowledged) {
            throw Error(`Failed to insert contact. The write operation was not acknowledged`);
        }

        contact._id = result.insertedId;
        _dataUpdatedListener({
            groupId: contact.groupId.toString(),
            type: "contact"
        });

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

        _dataUpdatedListener({
            groupId: "TBD",
            type: "contact"
        });
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

        _dataUpdatedListener({
            groupId: "TBD",
            type: "score"
        });

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

    _dataUpdatedListener({
        groupId: "TBD",
        type: "score"
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

        _dataUpdatedListener({
            groupId: "TBD",
            type: "score"
        });
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

        const updated = result.matchedCount == 1 && result.modifiedCount == 1;
        if (updated) {
            _dataUpdatedListener({
                groupId: "TBD",
                type: "competition"
            });
        }

        return updated;
    }) ?? false;
}

export async function createCompetition(competition: Competition): Promise<Competition | null> {
    const newCompetition = await exec(async db => {
        const result = await db.collection("competitions").insertOne(competition);
        if (!result.acknowledged) {
            throw Error(`Failed to insert competition. The write operation was not acknowledged`);
        }

        competition._id = result.insertedId;

        _dataUpdatedListener({
            groupId: competition.groupId.toString(),
            type: "competition"
        });
    
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

        _dataUpdatedListener({
            groupId: "TBD",
            type: "competition"
        });
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

        const updated = result.matchedCount == 1 && result.modifiedCount == 1;
        if (updated) {
            _dataUpdatedListener({
                groupId: "TBD",
                type: "event"
            });
        }

        return updated;
    }) ?? false;
}

export async function createEvent(event: EventModel): Promise<EventModel | null> {
    const newEvent = await exec(async db => {
        const result = await db.collection("events").insertOne(event);
        if (!result.acknowledged) {
            throw Error(`Failed to insert event. The write operation was not acknowledged`);
        }

        event._id = result.insertedId;

        _dataUpdatedListener({
            groupId: "TBD",
            type: "event"
        });
    
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

        _dataUpdatedListener({
            groupId: "TBD",
            type: "event"
        });
    });
}

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

        const updated = result.matchedCount == 1 && result.modifiedCount == 1;
        if (updated) {
            _dataUpdatedListener({
                groupId: id,
                type: "group"
            });
        }

        return updated;
    }) ?? false;
}

export async function createGroup(group: Group): Promise<Group | null> {
    const newGroup = await exec(async db => {
        const result = await db.collection("groups").insertOne(group);
        if (!result.acknowledged) {
            throw Error(`Failed to insert group. The write operation was not acknowledged`);
        }

        group._id = result.insertedId;
        _dataUpdatedListener({
            groupId: group._id!.toString(),
            type: "group"
        });
    
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

        _dataUpdatedListener({
            groupId: groupId,
            type: "group"
        });
    });
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

    // await db.command({
    //     create: "event-scores",
    //     viewOn: "events",
    //     pipeline: [
    //         {
    //             $lookup: {
    //                 from: "scores",
    //                 localField: "_id",
    //                 foreignField: "eventId",
    //                 as: "eventScores"
    //             },
    //             $project: {
    //                 _id: 1,
    //                 name: 1,
    //                 notes: 1,
    //                 scores: "$eventScores.scores"
    //             }
    //         }
    //     ]
    // });
}
