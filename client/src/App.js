import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Layout, Menu, Spin, Drawer, Button, Avatar, Typography, theme } from 'antd';
import { HomeOutlined, GroupOutlined, TeamOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons';
import MyGroupsAsAdmin from './component/mygroupadmin'; // component cho người tạo nhóm
import MyGroups from './component/mygropeusers'; // component cho người dùng
import MyTasks from './component/mytask';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [telegramUser, setTelegramUser] = useState(null); 
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedMenuKey, setSelectedMenuKey] = useState('1');

  const { token } = theme.useToken();

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
          const response = await axios.get(`https://telegram-miniappp.onrender.com/api/users/telegram/${telegramUser.id}`);
          const userData = response.data;
          setUser(userData);  // Cập nhật dữ liệu người dùng
  
          const groupsResponse = await axios.get(`https://telegram-miniappp.onrender.com/api/teams/user/${userData.id}`);
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
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: token.colorBgContainer
      }}>
        <Spin size="large" />
      </div>
    );
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
        <Drawer
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '8px 0'
            }}>
              <Avatar 
                size={40} 
                icon={<UserOutlined />} 
                style={{ 
                  backgroundColor: token.colorPrimary,
                  color: '#fff'
                }} 
              />
              <div>
                <Title level={5} style={{ margin: 0 }}>
                  {telegramUser?.first_name} {telegramUser?.last_name}
                </Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  ID: {telegramUser?.id}
                </Text>
              </div>
            </div>
          }
          placement="left"
          closable={true}
          onClose={toggleDrawer}
          open={drawerVisible}
          width={280}
          styles={{
            body: {
              padding: '16px'
            },
            header: {
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              padding: '16px'
            }
          }}
        >
          <Menu
            theme="light"
            selectedKeys={[selectedMenuKey]}
            onClick={handleMenuClick}
            style={{ 
              border: 'none',
              borderRadius: token.borderRadiusLG
            }}
            items={[
              {
                key: '1',
                icon: <HomeOutlined />,
                label: <Link to="/my-tasks">My Tasks</Link>,
                style: {
                  marginBottom: '8px',
                  borderRadius: token.borderRadiusLG,
                  height: '48px',
                  lineHeight: '48px'
                }
              },
              {
                key: '2',
                icon: <GroupOutlined />,
                label: <Link to="/my-group">My Groups</Link>,
                style: {
                  marginBottom: '8px',
                  borderRadius: token.borderRadiusLG,
                  height: '48px',
                  lineHeight: '48px'
                }
              },
              {
                key: '3',
                icon: <TeamOutlined />,
                label: <Link to="/admin/my-groups">My Created Groups</Link>,
                style: {
                  marginBottom: '8px',
                  borderRadius: token.borderRadiusLG,
                  height: '48px',
                  lineHeight: '48px'
                }
              }
            ]}
          />
        </Drawer>

        <Header style={{
          background: token.colorBgContainer,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          height: 64,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={toggleDrawer}
            style={{ 
              marginRight: 16,
              fontSize: '18px'
            }}
          />
          <Title level={4} style={{ margin: 0, color: token.colorTextHeading }}>
            Group Manager
          </Title>
        </Header>

        <Content style={{ 
          padding: '24px',
          background: token.colorBgLayout,
          minHeight: 'calc(100vh - 64px - 70px)'
        }}>
          <div style={{ 
            background: token.colorBgContainer,
            padding: 24,
            borderRadius: token.borderRadiusLG,
            minHeight: 360,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}>
            <Routes>
              <Route path="/" element={<Navigate to="/my-tasks" replace />} />
              <Route path="/my-tasks" element={<MyTasks tasks={tasks} />} />
              <Route path="/my-group" element={<MyGroups user={user} groups={memberGroups} />} />
              <Route path="/admin/my-groups" element={<MyGroupsAsAdmin user={user} groups={createdGroups} />} />
              <Route path="*" element={<h2>Page not found</h2>} />
            </Routes>
          </div>
        </Content>

        <Footer style={{ 
          textAlign: 'center',
          background: token.colorBgContainer,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          padding: '16px 50px'
        }}>
          <Text type="secondary">
            Telegram MiniApp ©
          </Text>
        </Footer>
      </Layout>
    </Router>
  );
}

export default App;