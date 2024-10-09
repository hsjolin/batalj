import { Request } from "express";
import { Competition, Contact, Event, Group } from "../models";

export function getGroup(req: Request): Group {
    return get<Group>("Group", req);
}

export function setGroup(req: Request, group: Group): void {
    set("Group", group, req);
}

export function getContact(req: Request): Contact {
    return get<Contact>("Contact", req);
}

export function setContact(req: Request, contact: Contact): void {
    set("Contact", contact, req);
}

export function getCompetition(req: Request): Competition {
    return get<Competition>("Competition", req);
}

export function setCompetition(req: Request, competition: Competition): void {
    set("Competition", competition, req);
}

export function getEvent(req: Request): Event {
    return get<Event>("Event", req);
}

export function setEvent(req: Request, event: Event): void {
    set("Event", event, req);
}

export function setError(req: Request, message:string): void {
    set("Error", message, req);
}

export function getError(req: any): string | null {
    const value = req["Error"];
    if (value) {
        return value as string;
    }

    return null;
}

function get<T>(name: string, req: any): T {
    const value = req[name];
    if (value) {
        return value as T;
    }

    throw Error(`${name} was null or undefined`);
}

function set(name: string, value: any, req: any): void {
    req[name] = value;
}