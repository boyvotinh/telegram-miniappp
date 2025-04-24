import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import MyGroupsAsAdmin from './component/mygroupadmin'; // component cho người tạo nhóm
import MyGroups from './component/mygropeusers'; // component cho người dùng
import MyTasks from './component/mytask';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  console.log("User:", user);
  console.log("Groups:", groups);
  
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const telegram_id = '123456789'; // Test ID (update as needed)
        const response = await axios.get(`http://localhost:3001/api/users/me?telegram_id=${telegram_id}`);
        const userData = response.data;
        setUser(userData);

        const groupsResponse = await axios.get(`http://localhost:3001/api/teams/by-user/${userData.id}`);
        setGroups(groupsResponse.data);

        const taskResponse = await axios.get(`http://localhost:3001/api/tasks/by-user/${userData.id}`);
        setTasks(taskResponse.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserInfo();
  }, []);

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (!user) {
    return <div>Unable to fetch user data.</div>;
  }

  // Lọc nhóm cho người dùng (user) và người tạo nhóm (admin)
  const createdGroups = groups.filter(group => group.role === 'admin'); // Nhóm do người dùng tạo
  const memberGroups = groups.filter(group => group.role !== 'admin');
  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <header>
          <h1>Hello, {user.first_name} {user.last_name}</h1>
          <nav>
            <Link to="/my-tasks">My Tasks</Link> |{' '}
            <Link to="/my-group">My Group</Link> |{' '}
            <Link to="/admin/my-groups">My Created Groups</Link>
          </nav>
          <hr />
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/my-tasks" replace />} />
          <Route path="/my-tasks" element={<MyTasks tasks={tasks} />} />
          <Route path="/my-group" element={<MyGroups user={user} groups={memberGroups} />} />
          <Route path="/admin/my-groups" element={<MyGroupsAsAdmin user={user} groups={createdGroups} />} />
          <Route path="*" element={<h2>Page not found</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
