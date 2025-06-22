import React, { useState, useEffect } from 'react';
import {
  List, Card, Typography, Button, Input, Divider, Empty, message as antdMessage,
  Avatar, Modal, Tag, Space, DatePicker, theme, Row, Col, Statistic, Progress, Badge
} from 'antd';
import { 
  TeamOutlined, PlusOutlined, UserOutlined, FormOutlined, DeleteOutlined,
  ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined,
  CalendarOutlined, TeamOutlined as TeamIcon
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
const { Title, Text, Paragraph } = Typography;

function MyGroupsAsAdmin({ user, groups }) {
  const { token } = theme.useToken();
  const [groupName, setGroupName] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [adminGroups, setAdminGroups] = useState(
    groups.filter(group => group.created_by === user.id)
  );
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [groupMembers, setGroupMembers] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'pending', 
    deadline: null
  });
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchAllGroupMembers = async () => {
      try {
        const memberCounts = {};
        for (const group of adminGroups) {
          const response = await axios.get(`https://telegram-miniappp.onrender.com/api/teams/${group.id}/members`);
          memberCounts[group.id] = response.data.members.length;
        }
        setGroupMembers(memberCounts);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin thành viên:', error);
      }
    };

    if (adminGroups.length > 0) {
      fetchAllGroupMembers();
    }
  }, [adminGroups]);

  useEffect(() => {
    if (selectedGroup) {
      const fetchMembers = async () => {
        try {
          const response = await axios.get(`https://telegram-miniappp.onrender.com/api/teams/${selectedGroup.id}/members`);
          setMembers(response.data.members);
        } catch (error) {
          console.error('Lỗi khi lấy thành viên:', error);
          setMembers([]);
        }
      };
      fetchMembers();
    }
  }, [selectedGroup]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      antdMessage.warning('Tên nhóm không được để trống.');
      return;
    }
    try {
      const response = await axios.post('https://telegram-miniappp.onrender.com/api/teams/create', {
        name: groupName,
        created_by: user.id
      });
      const newGroup = {
        id: response.data.teamId,
        name: groupName,
        created_by: user.id
      };
      setAdminGroups(prev => [...prev, newGroup]);
      setGroupName('');
      antdMessage.success('Tạo nhóm thành công!');
    } catch (error) {
      console.error('Lỗi khi tạo nhóm:', error);
      if (error.response) {
        // Nếu server trả về lỗi
        console.error('Lỗi từ server:', error.response.data);
        antdMessage.error(error.response.data.error || 'Tạo nhóm thất bại!');
      } else {
        // Lỗi kết nối hoặc lỗi khác
        antdMessage.error('Không thể kết nối tới máy chủ!');
      }
    }
  };

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
    setMembers([]);
  };

  const handleAssignTask = async () => {
    if (!newTask.title.trim()) {
      antdMessage.warning('Tiêu đề nhiệm vụ không được để trống.');
      return;
    }

    if (!selectedMember) {
      antdMessage.warning('Chọn thành viên để giao nhiệm vụ.');
      return;
    }

    if (!newTask.deadline) {
      antdMessage.warning('Chọn hạn chót cho nhiệm vụ.');
      return;
    }

    try {
      const formattedDeadline = newTask.deadline ? newTask.deadline.format('YYYY-MM-DD') : null;

      const response = await axios.post('https://telegram-miniappp.onrender.com/api/tasks/assign', {
        ...newTask,
        assigned_to: selectedMember.id,
        team_id: selectedGroup.id,
        deadline: formattedDeadline,
      });

      antdMessage.success('Giao nhiệm vụ thành công!');
      setIsAssignTaskModalOpen(false);
      setNewTask({ title: '', description: '', status: 'pending', deadline: null });
      setTasks(prevTasks => [
        ...prevTasks,
        { id: response.data.taskId, title: newTask.title, description: newTask.description, status: 'pending', deadline: formattedDeadline },
      ]);
    } catch (error) {
      console.error('Lỗi khi giao nhiệm vụ:', error);
      antdMessage.error('Giao nhiệm vụ thất bại!');
    }
  };

  const handleInviteMember = async () => {
    if (!telegramId.trim()) {
      antdMessage.warning('Vui lòng nhập ID Telegram.');
      return;
    }
  
    try {
      await axios.post('https://telegram-miniappp.onrender.com/api/teams/invite', {
        team_id: selectedGroup.id,
        telegram_id: telegramId
      });
  
      antdMessage.success('Đã mời thành viên thành công!');
      setTelegramId('');
      const response = await axios.get(`https://telegram-miniappp.onrender.com/api/teams/${selectedGroup.id}/members`);
      setMembers(response.data.members);
    } catch (error) {
      console.error('Lỗi khi mời thành viên:', error);
      antdMessage.error('Không thể mời thành viên.');
    }
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  const handleViewTasks = async (member) => {
    try {
      const response = await axios.get(`https://telegram-miniappp.onrender.com/api/tasks/user/${member.id}`);
      const memberTasks = response.data.filter(task => task.team_id === selectedGroup.id);
      setTasks(memberTasks);
      setSelectedMember(member);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Lỗi khi lấy nhiệm vụ đã giao:', error);
      antdMessage.error('Không thể lấy nhiệm vụ');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOpenAssignTaskModal = (member) => {
    setSelectedMember(member);
    setIsAssignTaskModalOpen(true);
  };

  const handleEditTask = async () => {
    if (!newTask.title.trim()) {
      antdMessage.warning('Tiêu đề nhiệm vụ không được để trống.');
      return;
    }
    if (!newTask.deadline) {
      antdMessage.warning('Chọn hạn chót cho nhiệm vụ.');
      return;
    }

    try {
      const formattedDeadline = newTask.deadline ? newTask.deadline.format('YYYY-MM-DD') : null;

      await axios.put(`https://telegram-miniappp.onrender.com/api/tasks/update/${selectedTask.id}`, {
        ...newTask,
        deadline: formattedDeadline,
      });

      antdMessage.success('Cập nhật nhiệm vụ thành công!');
      setIsAssignTaskModalOpen(false);
      setNewTask({ title: '', description: '', status: 'pending', deadline: null });
      setSelectedTask(null);
    } catch (error) {
      console.error('Lỗi khi cập nhật nhiệm vụ:', error);
      antdMessage.error('Cập nhật nhiệm vụ thất bại!');
    }
  };

  const handleEditTaskModal = (task) => {
    setSelectedTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      status: task.status,
      deadline: task.deadline ? dayjs(task.deadline) : null
    });
    setIsAssignTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`https://telegram-miniappp.onrender.com/api/tasks/delete/${taskId}`);
      antdMessage.success('Đã xóa nhiệm vụ');
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Lỗi khi xóa nhiệm vụ:', error);
      antdMessage.error('Không thể xóa nhiệm vụ');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await axios.delete('https://telegram-miniappp.onrender.com/api/teams/remove-member', {
        data: {
          team_id: selectedGroup.id,
          user_id: memberId,
        },
      });
      
    } catch (error) {
      console.error('Lỗi khi xóa thành viên:', error);
      antdMessage.error('Không thể xóa thành viên');
    }
    setMembers(prev => prev.filter(member => member.id !== memberId));

  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)',
        padding: '24px',
        borderRadius: '12px',
        color: 'white',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(114,46,209,0.2)'
      }}>
        <Row gutter={[24, 24]} align="middle">
          <Col>
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              <TeamOutlined /> Nhóm bạn đã tạo
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
              Quản lý và theo dõi các nhóm của bạn
            </Text>
          </Col>
          <Col>
            <Statistic 
              value={adminGroups.length} 
              suffix="nhóm"
              valueStyle={{ color: 'white' }}
            />
          </Col>
        </Row>
      </div>

      {adminGroups.length === 0 ? (
        <Card style={{ 
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginTop: 24
        }}>
          <Empty 
            description="Bạn chưa tạo nhóm nào. Hãy tạo nhóm mới!" 
            style={{ margin: '50px 0' }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <List
          grid={{ gutter: 24, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 3 }}
          dataSource={adminGroups.slice().reverse()}
          renderItem={group => (
            <List.Item>
              <Card
                hoverable
                onClick={() => handleSelectGroup(group)}
                style={{ 
                  borderRadius: 12,
                  transition: 'all 0.3s',
                  height: '100%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                bodyStyle={{ padding: '20px' }}
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
                    <Title level={4} style={{ margin: 0 }}>
                      {group.name}
                    </Title>
                  }
                  description={
                    <Space direction="vertical" size="small" style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        <UserOutlined /> {groupMembers[group.id] || 0} thành viên
                      </Text>
                      <Text type="secondary">
                        <CalendarOutlined /> Tạo ngày {dayjs(group.created_at).format('DD/MM/YYYY')}
                      </Text>
                    </Space>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}

      <Card 
        style={{ 
          marginTop: 24,
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Title level={4} style={{ marginBottom: 16 }}>
          <PlusOutlined style={{ color: '#1890ff' }} /> Tạo nhóm mới
        </Title>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Input
            placeholder="Nhập tên nhóm mới"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            size="large"
            style={{ maxWidth: 400 }}
          />
          <Button 
            type="primary" 
            onClick={handleCreateGroup}
            size="large"
            icon={<PlusOutlined />}
          >
            Tạo nhóm
          </Button>
        </Space>
      </Card>

      <Modal
        title={
          <Space>
            <TeamOutlined style={{ color: '#1890ff' }} />
            <span>Chi tiết nhóm: {selectedGroup?.name}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={800}
        bodyStyle={{ padding: '24px' }}
      >
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card 
              title="Danh sách thành viên" 
              variant="borderless"
              style={{ borderRadius: 12 }}
              bodyStyle={{ padding: '16px' }}
            >
              {members.length === 0 ? (
                <Empty description="Không có thành viên nào." image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={members}
                  renderItem={member => (
                    <List.Item
                      actions={[
                        <Button 
                          type="primary" 
                          onClick={() => handleViewTasks(member)}
                          icon={<FormOutlined />}
                        >
                          Xem nhiệm vụ
                        </Button>,
                        <Button 
                          danger 
                          onClick={() => handleRemoveMember(member.id)}
                          icon={<DeleteOutlined />}
                        >
                          Xóa
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            size={40} 
                            icon={<UserOutlined />}
                            style={{ 
                              backgroundColor: '#1890ff',
                              boxShadow: '0 2px 8px rgba(24,144,255,0.3)'
                            }}
                          />
                        }
                        title={<Text strong>{member.name}</Text>}
                        description={
                          <Space direction="vertical" size="small">
                            <Text type="secondary">Telegram ID: {member.telegram_id}</Text>
                            <Space>
                              <Tag color="blue">Thành viên</Tag>
                              <Tag color="green">Đang hoạt động</Tag>
                            </Space>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
          <Col span={24}>
            <Card 
              title="Mời thêm thành viên" 
              variant="borderless"
              style={{ borderRadius: 12 }}
              bodyStyle={{ padding: '16px' }}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="Nhập Telegram ID"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  size="large"
                />
                <Button 
                  type="primary" 
                  onClick={handleInviteMember}
                  size="large"
                  icon={<PlusOutlined />}
                >
                  Mời
                </Button>
              </Space.Compact>
            </Card>
          </Col>
        </Row>
      </Modal>

      <Modal
        title={
          <Space>
            <FormOutlined style={{ color: '#1890ff' }} />
            <span>{selectedTask ? 'Chỉnh sửa nhiệm vụ' : 'Giao nhiệm vụ mới'}</span>
          </Space>
        }
        open={isAssignTaskModalOpen}
        onCancel={() => {
          setIsAssignTaskModalOpen(false);
          setNewTask({ title: '', description: '', status: 'pending', deadline: null });
          setSelectedTask(null);
        }}
        onOk={selectedTask ? handleEditTask : handleAssignTask}
        okText={selectedTask ? 'Cập nhật' : 'Giao nhiệm vụ'}
        width={600}
        bodyStyle={{ padding: '24px' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Input
            placeholder="Tiêu đề nhiệm vụ"
            value={newTask.title}
            onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
            size="large"
          />
          <Input.TextArea
            rows={4}
            placeholder="Mô tả nhiệm vụ"
            value={newTask.description}
            onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
          />
          <DatePicker
            placeholder="Chọn hạn chót"
            value={newTask.deadline}
            onChange={(date) => setNewTask(prev => ({ ...prev, deadline: date }))}
            style={{ width: '100%' }}
            size="large"
          />
        </Space>
      </Modal>

      <Modal
        title={
          <Space>
            <FormOutlined style={{ color: '#1890ff' }} />
            <span>Nhiệm vụ đã giao cho {selectedMember?.name}</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenAssignTaskModal(selectedMember)}
            size="large"
          >
            Thêm nhiệm vụ
          </Button>
        ]}
        width={800}
        bodyStyle={{ padding: '24px' }}
      >
        {tasks.length === 0 ? (
          <Empty description="Chưa có nhiệm vụ nào." image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <List
              dataSource={tasks}
              renderItem={task => (
                <List.Item
                  actions={[
                    <Button
                      type="primary"
                      icon={<FormOutlined />}
                      onClick={() => handleEditTaskModal(task)}
                    >
                      Sửa
                    </Button>,
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Xóa
                    </Button>
                  ]}
                >
                  <Card 
                    style={{ 
                      width: '100%',
                      borderRadius: 12,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    variant="borderless"
                    bodyStyle={{ padding: '16px' }}
                  >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Title level={5} style={{ margin: 0 }}>{task.title}</Title>
                      <Paragraph>{task.description || 'Không có mô tả'}</Paragraph>
                      <Space>
                        <Badge 
                          status={
                            task.status === 'completed' ? 'success' :
                            task.status === 'pending' ? 'processing' : 'error'
                          }
                          text={
                            <Tag color={
                              task.status === 'completed' ? 'success' :
                              task.status === 'pending' ? 'processing' : 'error'
                            }>
                              {task.status === 'completed' ? <CheckCircleOutlined /> :
                               task.status === 'pending' ? <ClockCircleOutlined /> :
                               <CloseCircleOutlined />} {task.status}
                            </Tag>
                          }
                        />
                        <Tag color="blue">
                          <CalendarOutlined /> Hạn chót: {task.deadline ? dayjs(task.deadline).format('DD/MM/YYYY') : 'Không có'}
                        </Tag>
                      </Space>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MyGroupsAsAdmin;