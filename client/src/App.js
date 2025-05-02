import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Layout, Menu, Spin, Drawer, Button } from 'antd';
import { HomeOutlined, GroupOutlined, TeamOutlined, MenuOutlined } from '@ant-design/icons';
import MyGroupsAsAdmin from './component/mygroupadmin'; // component cho người tạo nhóm
import MyGroups from './component/mygropeusers'; // component cho người dùng
import MyTasks from './component/mytask';

const { Header, Content, Footer } = Layout;

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
        // console.log('Telegram User:', initDataUnsafe.user);
        setTelegramUser(initDataUnsafe.user);  // Cập nhật thông tin người dùng từ Telegram WebApp
      } else {
        setTelegramUser({
          id: '1234567891',  // ID mặc định
          first_name: 'test', // Tên mặc định
          last_name: 'User',  // Họ tên mặc định
        });
      }
      setLoading(false);  // Dừng loading khi đã có thông tin
    } else {
      // Nếu không mở qua Telegram WebApp, sử dụng thông tin mặc định
      setTelegramUser({
        id: '1234567891',  // ID mặc định
        first_name: 'test',
        last_name: 'User',
      });
      setLoading(false);  // Dừng loading
    }
  }, []);
  
  useEffect(() => {
    if (telegramUser) {
      const fetchUserInfo = async () => {
        try {
          // console.log('Fetching user info for', telegramUser.id);
          const response = await axios.get(`https://telegram-miniappp.onrender.com/api/users/me?telegram_id=${telegramUser.id}`);
          const userData = response.data;
          setUser(userData);  // Cập nhật dữ liệu người dùng
  
          const groupsResponse = await axios.get(`https://telegram-miniappp.onrender.com/api/teams/by-user/${userData.id}`);
          setGroups(groupsResponse.data);  // Lưu thông tin nhóm
  
          const taskResponse = await axios.get(`https://telegram-miniappp.onrender.com/api/tasks/user/${userData.id}`);
          setTasks(taskResponse.data);  // Lưu thông tin nhiệm vụ
        } catch (error) {
          console.error('Lỗi khi lấy thông tin người dùng:', error);
        } finally {
          setLoading(false);  // Kết thúc loading khi dữ liệu đã được tải
        }
      };
  
      fetchUserInfo();
    }
  }, [telegramUser]);  // Mỗi khi telegramUser thay đổi, gọi lại useEffect
  
  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
  }
  // nếu chạy test sửa fontend thì // đống này đi
  // if (!user) {
  //   return (
  //     <div style={{ textAlign: 'center', marginTop: 100 }}>
  //       <h2>❌ Không thể lấy dữ liệu người dùng.</h2>
  //       <p>Vui lòng mở ứng dụng này thông qua Telegram bằng cách bấm vào link:</p>
  //       <a href="https://t.me/test20214bot/my_app" target="_blank" rel="noopener noreferrer">
  //         👉 Mở lại Mini App trong Telegram
  //       </a>
  //     </div>
  //   );
  // }
  

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
          title={<span style={{ fontWeight: 'bold', fontSize: 18 }}>📋 Menu</span>}
          placement="left"
          closable={true}
          onClose={toggleDrawer}
          open={drawerVisible}
          width={260}
          bodyStyle={{ padding: '0 16px' }}
        >
          {/* Thông tin người dùng */}
          <div style={{ textAlign: 'center', margin: '16px 0', padding: 12, background: '#f0f2f5', borderRadius: 8 }}>
            <div style={{ fontWeight: 'bold', fontSize: 16 }}>
              {telegramUser?.first_name} {telegramUser?.last_name}
            </div>
            <div style={{ fontSize: 13, color: '#555' }}>ID: {telegramUser?.id}</div>
          </div>
  
          <Menu
            theme="light"
            selectedKeys={[selectedMenuKey]}
            onClick={handleMenuClick}
            style={{ border: 'none' }}
          >
            <Menu.Item
              key="1"
              icon={<HomeOutlined />}
              style={{
                marginBottom: '8px',
                padding: '12px',
                borderRadius: '6px',
              }}
            >
              <Link to="/my-tasks">📝 My Tasks</Link>
            </Menu.Item>
  
            <Menu.Item
              key="2"
              icon={<GroupOutlined />}
              style={{
                marginBottom: '8px',
                padding: '12px',
                borderRadius: '6px',
              }}
            >
              <Link to="/my-group">👥 My Groups</Link>
            </Menu.Item>
  
            <Menu.Item
              key="3"
              icon={<TeamOutlined />}
              style={{
                marginBottom: '8px',
                padding: '12px',
                borderRadius: '6px',
              }}
            >
              <Link to="/admin/my-groups">🛠 My Created Groups</Link>
            </Menu.Item>
          </Menu>
        </Drawer>
  
        {/* Header */}
        <Header style={{
          background: '#001529',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          height: 64
        }}>
          <Button
            type="primary"
            icon={<MenuOutlined />}
            onClick={toggleDrawer}
            style={{ marginRight: 16 }}
          />
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
            Telegram MiniApp
          </div>
        </Header>
  
        {/* Nội dung */}
        <Content style={{ padding: '24px 16px', background: '#f0f2f5' }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, minHeight: 360 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/my-tasks" replace />} />
              <Route path="/my-tasks" element={<MyTasks tasks={tasks} />} />
              <Route path="/my-group" element={<MyGroups user={user} groups={memberGroups} />} />
              <Route path="/admin/my-groups" element={<MyGroupsAsAdmin user={user} groups={createdGroups} />} />
              <Route path="*" element={<h2>Page not found</h2>} />
            </Routes>
          </div>
        </Content>
  
        {/* Footer */}
        <Footer style={{ textAlign: 'center', background: '#001529', color: '#fff' }}>
         Ant Design ©2025
        </Footer>
      </Layout>
    </Router>
  );
}

export default App;
