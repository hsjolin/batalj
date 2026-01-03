import { ObjectId } from "mongodb";

export interface InviteToken {
    token: string;
    email: string;
    createdAt: Date;
    usedAt?: Date;
}

export interface Contact {
    _id?: ObjectId;
    groupId: ObjectId;
    first: string;
    last: string;
    notes: string;
    avatar: string;
    email?: string;
}

export interface Group {
    _id?: ObjectId;
    name: string;
    notes: string;
    slug: string;
    password: string;
    inviteTokens?: InviteToken[];
}

export interface Competition {
    _id?: ObjectId;
    groupId: ObjectId;
    name: string;
    notes: string;
}

export interface Activity {
    _id?: ObjectId;
    competitionId: ObjectId;
    name: string;
    notes: string;
    activityType: ActivityType;
}

export type ActivityType =
    | "TIME_LONG_BETTER"
    | "TIME_SHORT_BETTER"
    | "TIME_MATCHING"
    | "POINTS_HIGH_BETTER"
    | "POINTS_LOW_BETTER";

export interface Score {
    _id?: ObjectId;
    contactId: ObjectId;
    eventId: ObjectId;
    score: number;
    result: number;
    time1?: number;
    time2?: number;
}

// Legacy alias for backwards compatibility
export type Event = Activity;
export type ResultType = ActivityType;