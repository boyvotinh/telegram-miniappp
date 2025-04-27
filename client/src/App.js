import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Layout, Menu, Spin, Typography, Drawer, Button, message } from 'antd';
import { HomeOutlined, GroupOutlined, TeamOutlined, MenuOutlined } from '@ant-design/icons';
import MyGroupsAsAdmin from './component/mygroupadmin';
import MyGroups from './component/mygropeusers';
import MyTasks from './component/mytask';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [telegramUser, setTelegramUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedMenuKey, setSelectedMenuKey] = useState('1');
  const [isTelegramEnv, setIsTelegramEnv] = useState(false);

  useEffect(() => {
    // Kiểm tra môi trường chạy
    const checkTelegramEnv = () => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        setIsTelegramEnv(true);
        console.log('Running in Telegram Mini App');
        
        const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
        if (initDataUnsafe?.user) {
          console.log('Telegram user:', initDataUnsafe.user);
          setTelegramUser(initDataUnsafe.user);
        } else {
          console.warn('No Telegram user data found');
          setLoading(false);
        }
      } else {
        console.log('Running in normal web environment');
        setIsTelegramEnv(false);
        setLoading(false);
        
        // Kiểm tra nếu có user trong localStorage (cho web thường)
        const savedUser = localStorage.getItem('webUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    };

    checkTelegramEnv();
  }, []);

  useEffect(() => {
    if (telegramUser) {
      // Chạy trong Telegram - lấy thông tin từ Telegram
      const fetchTelegramUserInfo = async () => {
        try {
          const response = await axios.get(
            `https://telegram-miniappp.onrender.com/api/users/me?telegram_id=${telegramUser.id}`
          );
          const userData = response.data;
          setUser(userData);

          const [groupsResponse, taskResponse] = await Promise.all([
            axios.get(`https://telegram-miniappp.onrender.com/api/teams/by-user/${userData.id}`),
            axios.get(`https://telegram-miniappp.onrender.com/api/tasks/user/${userData.id}`)
          ]);

          setGroups(groupsResponse.data);
          setTasks(taskResponse.data);
        } catch (error) {
          console.error('Error fetching Telegram user info:', error);
          message.error('Failed to load Telegram user data');
        } finally {
          setLoading(false);
        }
      };

      fetchTelegramUserInfo();
    } else if (!isTelegramEnv && !user) {
      // Xử lý cho web thường (không phải Telegram)
      // Có thể thêm logic đăng nhập thông thường ở đây
      console.log('Normal web environment - no Telegram user');
    }
  }, [telegramUser, isTelegramEnv]);

  const handleWebLogin = (credentials) => {
    // Hàm này xử lý đăng nhập cho web thường
    // Ví dụ:
    axios.post('/api/web-login', credentials)
      .then(response => {
        const userData = response.data;
        setUser(userData);
        localStorage.setItem('webUser', JSON.stringify(userData));
      })
      .catch(error => {
        console.error('Login error:', error);
        message.error('Login failed');
      });
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
  }

  if (!user) {
    if (isTelegramEnv) {
      return (
        <div style={{ textAlign: 'center', marginTop: 100 }}>
          <h2>❌ Không thể lấy dữ liệu người dùng từ Telegram.</h2>
          <p>Vui lòng mở ứng dụng này thông qua Telegram bằng cách bấm vào link:</p>
          <a href="https://t.me/test20214bot/my_app" target="_blank" rel="noopener noreferrer">
            👉 Mở lại Mini App trong Telegram
          </a>
        </div>
      );
    } else {
      // Hiển thị form đăng nhập cho web thường
      return (
        <div style={{ textAlign: 'center', marginTop: 100 }}>
          <h2>Welcome to Task Manager</h2>
          {/* Thêm form đăng nhập ở đây */}
          <div style={{ maxWidth: 300, margin: '0 auto' }}>
            <input placeholder="Email" style={{ marginBottom: 10, padding: 8, width: '100%' }} />
            <input 
              placeholder="Password" 
              type="password" 
              style={{ marginBottom: 10, padding: 8, width: '100%' }} 
            />
            <Button 
              type="primary" 
              onClick={() => handleWebLogin({ email: 'test@example.com', password: '123' })}
              style={{ width: '100%' }}
            >
              Login
            </Button>
          </div>
        </div>
      );
    }
  }

  // Phần còn lại giữ nguyên
  const createdGroups = groups.filter(group => group.role === 'admin');
  const memberGroups = groups.filter(group => group.role !== 'admin');

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const handleMenuClick = (e) => {
    setSelectedMenuKey(e.key);
    if (window.innerWidth < 768) {
      setDrawerVisible(false);
    }
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        {/* Drawer và các phần khác giữ nguyên */}
        {/* ... */}
      </Layout>
    </Router>
  );
}

export default App;