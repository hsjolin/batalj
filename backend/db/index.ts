import { MongoClient, Db, ObjectId } from "mongodb";
import { Contact } from "../models";

var _client: MongoClient | null;
const uri = "mongodb://localhost:27017/?retryWrites=true";

async function getClient(): Promise<MongoClient> {
    if (_client == null) {
        _client = new MongoClient(uri);
        console.log("Opening database connection");
        return await _client.connect();
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

export async function getContacts(groupId: string): Promise<Contact[]> {
    return await exec(async db => {
        const results = await db.collection("contacts").find({ groupId }).toArray();
        return results.map(c => {
            return c as Contact;
        });
    }) ?? [];
}

export async function updateContact(id: string, updates: any): Promise<Boolean> {
    return await exec(async db => {
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
        const result = await db.collection("contacts").deleteOne({ _id: new ObjectId(contactId) });
        if (!result.acknowledged) {
            throw Error(`Failed to delete contact. The write operation was not acknowledged`);
        }
    });
}