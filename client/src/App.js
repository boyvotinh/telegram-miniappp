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
        console.log('User từ Telegram:', initDataUnsafe.user);
        setTelegramUser(initDataUnsafe.user);
      } else {
        alert('Không thể lấy dữ liệu người dùng từ Telegram.');
        setLoading(false);
      }
    } else {
      console.warn('window.Telegram hoặc window.Telegram.WebApp không tồn tại');
      alert('Ứng dụng Telegram không được tải đúng cách.');
      setLoading(false);
    }
  }, []);  
  useEffect(() => {
    if (telegramUser) {
      const verifyAndFetchUserInfo = async () => {
        try {
          const initData = window.Telegram?.WebApp?.initData;
  
          if (!initData) {
            throw new Error('initData không tồn tại');
          }
  
          // 1. Gửi initData lên server để xác minh
          const verifyResponse = await axios.post('https://telegram-miniappp.onrender.com/api/auth/verify-initdata', { initData });
          
          const verifiedUser = verifyResponse.data.user;
          setUser(verifiedUser);
  
          // 2. Sau khi xác minh xong, lấy Group và Task
          const groupsResponse = await axios.get(`https://telegram-miniappp.onrender.com/api/teams/by-user/${verifiedUser.id}`);
          setGroups(groupsResponse.data);
  
          const taskResponse = await axios.get(`https://telegram-miniappp.onrender.com/api/tasks/user/${verifiedUser.id}`);
          setTasks(taskResponse.data);
  
        } catch (error) {
          console.error('Lỗi xác minh initData hoặc lấy dữ liệu người dùng:', error);
          alert('Xác minh người dùng thất bại, vui lòng mở lại Mini App từ Telegram.');
        } finally {
          setLoading(false);
        }
      };
  
      verifyAndFetchUserInfo();
    }
  }, [telegramUser]);
  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
  }
  
  if (!user) {
    alert("⚡ WebApp initDataUnsafe không có user. Có thể do không mở từ Telegram hoặc chưa gửi user data.");
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
