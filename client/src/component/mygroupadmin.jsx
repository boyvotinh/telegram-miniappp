import React, { useState } from 'react';
import {
  List, Card, Typography, Button, Input, Divider, Empty, message as antdMessage,
  Avatar, Modal, Tag
} from 'antd';
import { TeamOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

function MyGroupsAsAdmin({ user, groups }) {
  const [groupName, setGroupName] = useState('');
  const [adminGroups, setAdminGroups] = useState(
    groups.filter(group => group.created_by === user.id)
  );

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      antdMessage.warning('Tên nhóm không được để trống.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/teams/create', {
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
      antdMessage.error('Tạo nhóm thất bại!');
    }
  };
  // Khi click vào nhóm -> hiển thị modal và load nhiệm vụ
  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/tasks/by-group/${group.id}`);
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
  return (
    <div style={{ padding: 24 }}>
      <Title level={3}><TeamOutlined /> Nhóm bạn đã tạo</Title>
      {adminGroups.length === 0 ? (
        <Empty description="Bạn chưa tạo nhóm nào." style={{ marginTop: 50 }} />
      ) : (
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={adminGroups}
          renderItem={group => (
            <List.Item>
              <Card
                hoverable
                onClick={() => handleSelectGroup(group)}
                style={{ borderRadius: 12 }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={<strong>{group.name}</strong>}
                />
              </Card>
            </List.Item>
          )}
        />
      )}

      <Divider />
      <Title level={4}><PlusOutlined /> Tạo nhóm mới</Title>
      <Input
        placeholder="Nhập tên nhóm mới"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        style={{ maxWidth: 400, marginBottom: 12 }}
      />
      <br />
      <Button type="primary" onClick={handleCreateGroup}>Tạo nhóm</Button>

      {/* Modal khi click vào nhóm */}
      <Modal
        title={`Chi tiết nhóm: ${selectedGroup?.name}`}
        open={isModalOpen}
        onCancel={closeModal}
        footer={<Button onClick={closeModal}>Đóng</Button>}>
        <Divider />
        <Title level={5}>Danh sách thành viên: </Title>
        {tasks.length === 0 ? (
          <Empty description="Không có nhiệm vụ nào." />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={tasks}
            renderItem={task => (
              <List.Item key={task.id}>
                <Card>
                  <Title level={5}>{task.title}</Title>
                  <Text><strong>Mô tả:</strong> {task.description || 'Không có'}</Text><br />
                  <Text><strong>Trạng thái:</strong> <Tag color="blue">{task.status}</Tag></Text><br />
                  <Text><strong>Hạn chót:</strong> {task.deadline || 'Không có'}</Text>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
}

export default MyGroupsAsAdmin;
