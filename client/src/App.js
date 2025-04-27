import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Layout, Menu, Spin, Typography, Drawer, Button } from 'antd';
import { HomeOutlined, GroupOutlined, TeamOutlined, MenuOutlined } from '@ant-design/icons';
import MyGroupsAsAdmin from './component/mygroupadmin'; // component cho người tạo nhóm
import MyGroups from './component/mygropeusers'; // component cho người dùng
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

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      const initData = window.Telegram.WebApp.initData;
      const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
  
      if (initData && initDataUnsafe?.user) {
        // console.log('User từ Telegram:', initDataUnsafe.user);
        setTelegramUser(initDataUnsafe.user);
      } else {
        setLoading(false);
      }
    } else {
      // console.warn('window.Telegram hoặc window.Telegram.WebApp không tồn tại');
      setLoading(false);
    }
  }, []);  
  useEffect(() => {
    if (telegramUser) {
      const fetchUserInfo = async () => {
        try {
          const response = await axios.get(`https://telegram-miniappp.onrender.com/api/users/me?telegram_id=${telegramUser.id}`);
          const userData = response.data;
          setUser(userData);
  
          const groupsResponse = await axios.get(`https://telegram-miniappp.onrender.com/api/teams/by-user/${userData.id}`);
          setGroups(groupsResponse.data);
  
          const taskResponse = await axios.get(`https://telegram-miniappp.onrender.com/api/tasks/user/${userData.id}`);
          setTasks(taskResponse.data);
        } catch (error) {
          console.error('Lỗi khi lấy thông tin người dùng:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchUserInfo();
    }
  }, [telegramUser]);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
  }
  
  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <h2>❌ Không thể lấy dữ liệu người dùng.</h2>
        <p>Vui lòng mở ứng dụng này thông qua Telegram bằng cách bấm vào link:</p>
        <a href="https://t.me/test20214bot/my_app" target="_blank" rel="noopener noreferrer">
          👉 Mở lại Mini App trong Telegram
        </a>
      </div>
    );
  }

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
        {/* Drawer (sidebar) */}
        <Drawer
          title="Menu"
          placement="left"
          closable={false}
          onClose={toggleDrawer}
          open={drawerVisible}
          width={250}
        >
          {/* Hiển thị tên người dùng và Telegram ID */}
          <div style={{ color: '#ffffff', marginBottom: '20px', padding: '10px' }}>
            <span>Telegram ID: {telegramUser.id}</span>
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedMenuKey]}
            onClick={handleMenuClick}
            style={{
              backgroundColor: '#001529',  // Thay đổi màu nền của menu
              color: '#ffffff',            // Màu chữ
            }}
          >
            <Menu.Item key="1" icon={<HomeOutlined />}>
              <Link to="/my-tasks">My Tasks</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<GroupOutlined />}>
              <Link to="/my-group">My Groups</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<TeamOutlined />}>
              <Link to="/admin/my-groups">My Created Groups</Link>
            </Menu.Item>
          </Menu>
        </Drawer>

        <Header style={{ background: '#001529', padding: 0 }}>
          <Button
            className="menu-trigger"
            type="primary"
            onClick={toggleDrawer}
            icon={<MenuOutlined />}
            style={{ position: 'absolute', left: 0, top: 16 }}
          />
        </Header>

        <Content style={{ padding: '0 50px', marginTop: '20px' }}>
          <div className="site-layout-content">
            <Title level={2} style={{ textAlign: 'center' }}>
              Hello, {user.first_name} {user.last_name}
            </Title>

            <Routes>
              <Route path="/" element={<Navigate to="/my-tasks" replace />} />
              <Route path="/my-tasks" element={<MyTasks tasks={tasks} />} />
              <Route path="/my-group" element={<MyGroups user={user} groups={memberGroups} />} />
              <Route path="/admin/my-groups" element={<MyGroupsAsAdmin user={user} groups={createdGroups} />} />
              <Route path="*" element={<h2>Page not found</h2>} />
            </Routes>
          </div>
        </Content>

        <Footer style={{ textAlign: 'center' }}>Ant Design ©2025 Created by YourName</Footer>
      </Layout>
    </Router>
  );
}

export default App;
