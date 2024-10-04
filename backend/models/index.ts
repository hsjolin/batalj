import { ObjectId } from "mongodb";

export interface Contact {
    _id?: ObjectId;
    first: string;
    last: string;
    groupId: string;
}