import React, { useState } from 'react';
import axios from 'axios';
import {
  Typography, List, Card, Modal, Button, Divider, Tag, Empty, Avatar
} from 'antd';
import { UserOutlined, TeamOutlined, FileTextOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function MyGroupsAsUser({ user, groups }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);

    try {
      const response = await axios.get(`https://telegram-miniappp.onrender.com/api/tasks/user/${user.id}`);
      // console.log('Dữ liệu nhiệm vụ:', response.data);
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

  // Sửa đúng lọc nhóm
  const filteredGroups = groups.filter(group => group.role !== 'admin');

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}><TeamOutlined /> Nhóm tôi tham gia</Title>

      {filteredGroups.length === 0 ? (
        <Empty description="Bạn chưa tham gia nhóm nào." style={{ marginTop: 50 }} />
      ) : (
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={filteredGroups}
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
                  description={<Text type="secondary">Người tạo: {group.created_by}</Text>}
                />
              </Card>
            </List.Item>
          )}
        />
      )}

      <Modal
        title={<span><TeamOutlined /> Chi tiết nhóm: {selectedGroup?.name}</span>}
        open={isModalOpen}
        onCancel={closeModal}
        footer={<Button onClick={closeModal}>Đóng</Button>}
        width={700}
      >
        <p><strong>Người tạo:</strong> {selectedGroup?.created_by}</p>
        <Divider />
        <Title level={5}><FileTextOutlined /> Nhiệm vụ của bạn trong nhóm</Title>

        {tasks.length === 0 ? (
          <Empty description="Không có nhiệm vụ nào." style={{ marginTop: 30 }} />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={tasks}
            renderItem={task => (
              <List.Item key={task.id}>
                <Card style={{ borderRadius: 10 }}>
                  <Title level={5}>{task.title}</Title>
                  <Text><strong>Mô tả:</strong> {task.description || 'Không có'}</Text><br />
                  <Text><strong>Trạng thái:</strong> <Tag color="blue">{task.status || 'Chưa cập nhật'}</Tag></Text><br />
                  <Text><strong>Hạn chót:</strong> {task.deadline || 'Không có'}</Text><br />
                  <Text><strong>Nhóm:</strong> {task.groupName}</Text>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
}

export default MyGroupsAsUser;