import { MongoClient, Db } from "mongodb";
import { Contact } from "../models";

async function exec<T>(func: (db: Db) => Promise<T | null>): Promise<T | null> {
    const uri = "mongodb://localhost:27017/?retryWrites=true";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        return await func(client.db("batalj"));
    }
    catch (e) {
        throw e;
    }
    finally {
        client.close();
    }
}

export async function getContacts(groupId: string): Promise<Contact[]> {
    return await exec(async db => {
        const results = await db.collection("contacts").find({ groupId }).toArray();
        return results.map(c => {
            return c as Contact;
        });
    }) ?? [];
}

export async function updateContact(contact: Contact): Promise<Contact> {
    return await exec(async db => {
        const result = await db.collection("contacts").updateOne({ _id: contact._id }, contact);
        if (!result.acknowledged) {
            throw Error(`Failed to update contact. The write operation was not acknowledged`);
        }

        return contact;
    }) ?? contact;
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