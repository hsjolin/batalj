import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CompetitionList from './components/CompetitionList';
import CompetitionForm from './components/CompetitionForm';
import EventList from './components/EventList';
import Leaderboard from './components/LeaderBoard';

const App = () => {
    return (
        <Router>
            <h1>Batalj</h1>
            <nav>
                <ul>
                    <li><Link to="/">Tävlingar</Link></li>
                    <li><Link to="/add-competition">Ny tävling</Link></li>
                </ul>
            </nav>
            <Routes>
                <Route path="/" exact component={CompetitionList} />
                <Route path="/add-competition" component={CompetitionForm} />
                <Route path="/competition/:id" component={EventList} />
                <Route path="/leaderboard/:id" component={Leaderboard} />
            </Routes>
        </Router>
    );
};

export default App; 
