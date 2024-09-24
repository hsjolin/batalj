import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CompetitionForm = () => {
    const [name, setName] = useState('');
    const history = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to add competition to state or backend
        history.push('/');
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add Competition</h2>
            <input
                type="text"
                placeholder="Competition Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button type="submit">Add</button>
        </form>
    );
};

export default CompetitionForm;
