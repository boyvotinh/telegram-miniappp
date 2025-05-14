import React, { useState } from 'react';
import axios from 'axios';
import {
  Typography, List, Card, Modal, Button, Divider, Tag, Empty, Avatar, message
} from 'antd';
import { UserOutlined, TeamOutlined, FileTextOutlined, LogoutOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function MyGroupsAsUser({ user, groups }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

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

  const handleLeaveGroup = async () => {
    try {
      const initData = window.Telegram.WebApp.initDataUnsafe;
      if (!initData || !initData.user) {
        message.error('Không thể xác thực người dùng');
        return;
      }

      await axios.delete(`https://telegram-miniappp.onrender.com/api/users/leave-group`, {
        data: {
          groupId: selectedGroup.id,
          telegram_id: initData.user.id
        }
      });
      message.success('Đã rời nhóm thành công');
      setIsLeaveModalOpen(false);
      closeModal();
      // Refresh danh sách nhóm
      window.location.reload();
    } catch (error) {
      console.error('Lỗi khi rời nhóm:', error);
      message.error('Không thể rời nhóm. Vui lòng thử lại sau.');
    }
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
        footer={[
          <Button key="leave" danger icon={<LogoutOutlined />} onClick={() => setIsLeaveModalOpen(true)}>
            Rời nhóm
          </Button>,
          <Button key="close" onClick={closeModal}>
            Đóng
          </Button>
        ]}
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

      {/* Modal xác nhận rời nhóm */}
      <Modal
        title="Xác nhận rời nhóm"
        open={isLeaveModalOpen}
        onCancel={() => setIsLeaveModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsLeaveModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="confirm" type="primary" danger onClick={handleLeaveGroup}>
            Xác nhận rời nhóm
          </Button>
        ]}
      >
        <p>Bạn có chắc chắn muốn rời nhóm "{selectedGroup?.name}" không?</p>
        <p style={{ color: 'red' }}>Lưu ý: Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
}

export default MyGroupsAsUser;