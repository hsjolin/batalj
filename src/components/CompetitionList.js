import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CompetitionList = () => {
    const [competitions, setCompetitions] = useState([]);

    const addCompetition = (competition) => {
        setCompetitions([...competitions, competition]);
    };

    addCompetition({id: 1, name: "21:a Brödrakampen"});
    // addCompetition({id: 2, name: "23:a Brödrakampen"});
    // addCompetition({id: 3, name: "24:a Brödrakampen"});
    
    return (
        <div>
            <h2>Competitions</h2>
            <ul>
                {competitions.map((comp) => (
                    <li key={comp.id}>
                        <Link to={`/competition/${comp.id}`}>{comp.name}</Link>
                    </li>
                ))}
            </ul>
            <Link to="/add-competition">Add Competition</Link>
        </div>
    );
};

export default CompetitionList;
