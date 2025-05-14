import React, { useState } from 'react';
import axios from 'axios';
import {
  Typography, List, Card, Modal, Button, Divider, Tag, Empty, Avatar, message,
  Row, Col, Space, Badge, Statistic, Progress
} from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  LogoutOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  TeamOutlined as TeamIcon
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

function MyGroupsAsUser({ user, groups }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);

    try {
      const response = await axios.get(`https://telegram-miniappp.onrender.com/api/tasks/user/${user.id}?team_id=${group.id}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy nhiệm vụ:', error);
      setTasks([]);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
    setTasks([]);
  };

  const handleLeaveGroup = async () => {
    try {
      const initData = window.Telegram.WebApp.initDataUnsafe;
      if (!initData || !initData.user) {
        message.error('Không thể xác thực người dùng');
        return;
      }

      await axios({
        method: 'delete',
        url: `https://telegram-miniappp.onrender.com/api/users/leave-group`,
        data: {
          groupId: selectedGroup.id,
          telegram_id: initData.user.id
        }
      });
      
      message.success('Đã rời nhóm thành công');
      setIsLeaveModalOpen(false);
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error('Lỗi khi rời nhóm:', error);
      message.error(error.response?.data?.message || 'Không thể rời nhóm. Vui lòng thử lại sau.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'processing';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircleOutlined />;
      case 'in_progress':
        return <ClockCircleOutlined />;
      default:
        return <CloseCircleOutlined />;
    }
  };

  const getTaskStats = (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const pending = total - completed - inProgress;
    return { total, completed, inProgress, pending };
  };

  const filteredGroups = groups.filter(group => group.role !== 'admin');
  const taskStats = getTaskStats(tasks);

  return (
    <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)',
          padding: '24px',
          borderRadius: '12px',
          color: 'white',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(114,46,209,0.2)'
        }}>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            <TeamOutlined /> Nhóm tôi tham gia
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
            Quản lý và theo dõi các nhóm của bạn
          </Text>
        </div>

        {filteredGroups.length === 0 ? (
          <Card>
            <Empty 
              description="Bạn chưa tham gia nhóm nào." 
              style={{ marginTop: 50 }}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredGroups.map(group => (
              <Col xs={24} sm={12} md={8} lg={6} key={group.id}>
                <Card
                  hoverable
                  onClick={() => handleSelectGroup(group)}
                  style={{ 
                    borderRadius: 12,
                    height: '100%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Card.Meta
                    avatar={
                      <Avatar 
                        size={48}
                        icon={<TeamIcon />}
                        style={{ 
                          backgroundColor: '#1890ff',
                          boxShadow: '0 2px 8px rgba(24,144,255,0.3)'
                        }}
                      />
                    }
                    title={
                      <Text strong style={{ fontSize: '16px' }}>
                        {group.name}
                      </Text>
                    }
                    description={
                      <Space direction="vertical" size="small" style={{ marginTop: '8px' }}>
                        <Text type="secondary">
                          <TeamOutlined /> Nhóm
                        </Text>
                        <Button 
                          type="primary" 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectGroup(group);
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Space>

      <Modal
        title={
          <Space>
            <TeamOutlined />
            <span>Chi tiết nhóm: {selectedGroup?.name}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={closeModal}
        footer={[
          <Button 
            key="leave" 
            danger 
            icon={<LogoutOutlined />} 
            onClick={() => setIsLeaveModalOpen(true)}
          >
            Rời nhóm
          </Button>,
          <Button key="close" onClick={closeModal}>
            Đóng
          </Button>
        ]}
        width="90%"
        style={{ maxWidth: 800 }}
        bodyStyle={{ padding: '24px' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="Tổng số nhiệm vụ" 
                  value={taskStats.total}
                  prefix={<FileTextOutlined />}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="Đã hoàn thành" 
                  value={taskStats.completed}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="Đang thực hiện" 
                  value={taskStats.inProgress}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
            </Row>
            <Progress 
              percent={taskStats.total ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}
              status="active"
              style={{ marginTop: '16px' }}
            />
          </Card>

          <Title level={5}>
            <FileTextOutlined /> Nhiệm vụ của bạn trong nhóm
          </Title>

          {tasks.length === 0 ? (
            <Card>
              <Empty 
                description="Không có nhiệm vụ nào." 
                style={{ marginTop: 30 }}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          ) : (
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 1,
                md: 2,
                lg: 2,
                xl: 2,
                xxl: 2,
              }}
              dataSource={tasks}
              renderItem={task => (
                <List.Item>
                  <Card 
                    style={{ 
                      borderRadius: 10,
                      height: '100%',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Title level={5} style={{ margin: 0 }}>{task.title}</Title>
                      
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Paragraph>
                          <Text strong>Mô tả:</Text> {task.description || 'Không có'}
                        </Paragraph>
                        
                        <Space>
                          <Text strong>Trạng thái:</Text>
                          <Badge 
                            status={getStatusColor(task.status)}
                            text={
                              <Tag 
                                color={getStatusColor(task.status)}
                                icon={getStatusIcon(task.status)}
                              >
                                {task.status || 'Chưa cập nhật'}
                              </Tag>
                            }
                          />
                        </Space>

                        <Space>
                          <CalendarOutlined />
                          <Text>
                            <Text strong>Hạn chót:</Text> {task.deadline || 'Không có'}
                          </Text>
                        </Space>

                        <Space>
                          <TeamIcon />
                          <Text>
                            <Text strong>Nhóm:</Text> {task.groupName}
                          </Text>
                        </Space>
                      </Space>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          )}
        </Space>
      </Modal>

      <Modal
        title="Xác nhận rời nhóm"
        open={isLeaveModalOpen}
        onCancel={() => setIsLeaveModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsLeaveModalOpen(false)}>
            Hủy
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            danger 
            onClick={handleLeaveGroup}
          >
            Xác nhận rời nhóm
          </Button>
        ]}
      >
        <Space direction="vertical" size="middle">
          <Paragraph>
            Bạn có chắc chắn muốn rời nhóm "{selectedGroup?.name}" không?
          </Paragraph>
          <Text type="danger">
            <LogoutOutlined /> Lưu ý: Hành động này không thể hoàn tác.
          </Text>
        </Space>
      </Modal>
    </div>
  );
}

export default MyGroupsAsUser;