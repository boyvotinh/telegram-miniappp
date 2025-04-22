import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import  WebApp  from '@twa-dev/sdk';

// Các component tạm thời
const Home = ({ user }) => (
  <div>
    <h2>Xin chào, {user?.first_name || 'bạn'} 👋</h2>
    <p>Chào mừng bạn đến với MiniApp!</p>
  </div>
);

const MyTasks = () => <h2>📋 Danh sách nhiệm vụ của bạn</h2>;
const AdminDashboard = () => <h2>🛠 Khu vực Admin</h2>;

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    WebApp.ready(); // Kích hoạt giao diện WebApp

    const tgUser = WebApp.initDataUnsafe?.user;

    if (tgUser) {
      setUser(tgUser);
      console.log('User Telegram:', tgUser);
    }
  }, []);

  return (
    <Router>
      <div style={{ padding: '1rem', fontFamily: 'Arial' }}>
        <nav style={{ marginBottom: '1rem' }}>
          <Link to="/">🏠 Trang chủ</Link> |{' '}
          <Link to="/my-tasks">📋 Nhiệm vụ</Link> |{' '}
          <Link to="/admin">🛠 Admin</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/my-tasks" element={<MyTasks />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
