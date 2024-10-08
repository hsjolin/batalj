import { ObjectId } from "mongodb";
import { Type } from "typescript";

export interface Contact {
    _id?: ObjectId;
    groupId: ObjectId;
    first: string;
    last: string;
    notes: string;
}

export interface Group {
    _id?: ObjectId;
    name: string;
    notes: string;
}

export interface Competition {
    _id?: ObjectId;
    groupId: ObjectId;
    name: string;
    notes: string;
}

export interface Event {
    _id?: ObjectId;
    competitionId: ObjectId;
    name: string;
    notes: string;
    resultType: ResultType;
    highResultIsBetter: Boolean;
}

export type ResultType = "time" | "points";

export interface Score {
    _id?: ObjectId;
    contactId: ObjectId;
    eventId: ObjectId;
    score: number;
    result: number; 
}