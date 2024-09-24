import React from 'react';
import { useParams, Link } from 'react-router-dom';

const EventList = () => {
    const { id } = useParams();

    // Logic to get events for the competition by id

    return (
        <div>
        <h2>Events for Competition {id}</h2>
        {/* Render events and participants here */}
        <Link to={`/leaderboard/${id}`}>View Leaderboard</Link>
        </div>
    );
};

export default EventList;
