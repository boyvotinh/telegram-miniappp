import React, { useState, useEffect } from 'react';
import {
  List, Card, Typography, Button, Input, Divider, Empty, message as antdMessage,
  Avatar, Modal, Tag, Space, DatePicker
} from 'antd';
import { TeamOutlined, PlusOutlined, UserOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
const { Title, Text } = Typography;

function MyGroupsAsAdmin({ user, groups }) {
  const [groupName, setGroupName] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [adminGroups, setAdminGroups] = useState(
    groups.filter(group => group.created_by === user.id)
  );
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'pending', 
    deadline: null
  });
  const [selectedTask, setSelectedTask] = useState(null);

  // Lấy danh sách thành viên khi nhóm được chọn
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
      antdMessage.error('Tạo nhóm thất bại!');
    }
  };
// thẻ nhóm
  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
    setMembers([]);
  };
// giao việc
const handleAssignTask = async () => {
  // Kiểm tra tiêu đề không được để trống
  if (!newTask.title.trim()) {
    antdMessage.warning('Tiêu đề nhiệm vụ không được để trống.');
    return;
  }

  // Kiểm tra xem đã chọn thành viên chưa
  if (!selectedMember) {
    antdMessage.warning('Chọn thành viên để giao nhiệm vụ.');
    return;
  }

  // Kiểm tra deadline đã được chọn chưa
  if (!newTask.deadline) {
    antdMessage.warning('Chọn hạn chót cho nhiệm vụ.');
    return;
  }

  try {
    // Định dạng lại deadline nếu có
    const formattedDeadline = newTask.deadline ? newTask.deadline.format('YYYY-MM-DD') : null;

    // Gửi dữ liệu lên backend
    const response = await axios.post('https://telegram-miniappp.onrender.com/api/tasks/assign', {
      ...newTask,
      assigned_to: selectedMember.id,  // Gán thành viên vào nhiệm vụ
      team_id: selectedGroup.id,  // Gán nhóm vào nhiệm vụ
      deadline: formattedDeadline,  // Đảm bảo deadline được gửi đúng định dạng
    });
    console.log('Nhiệm vụ được giao:', response.data);

    // Hiển thị thông báo thành công và đóng modal
    antdMessage.success('Giao nhiệm vụ thành công!');
    setIsAssignTaskModalOpen(false);  // Đóng modal thêm nhiệm vụ
    setNewTask({ title: '', description: '', status: 'pending', deadline: null });// Reset form
    setTasks(prevTasks => [
      ...prevTasks,
      { id: response.data.taskId, title: newTask.title, description: newTask.description, status: 'pending', deadline: formattedDeadline },
    ]);
  } catch (error) {
    console.error('Lỗi khi giao nhiệm vụ:', error);
    antdMessage.error('Giao nhiệm vụ thất bại!');
  }
};

// Invite thành viên
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
      // Gọi lại API để load lại danh sách thành viên
      const response = await axios.get(`https://telegram-miniappp.onrender.com/api/teams/${selectedGroup.id}/members`);
      setMembers(response.data.members);
    } catch (error) {
      console.error('Lỗi khi mời thành viên:', error);
      antdMessage.error('Không thể mời thành viên.');
    }
  };
// view task
const [isModalVisible, setIsModalVisible] = useState(false);
const [tasks, setTasks] = useState([]);
const [selectedMember, setSelectedMember] = useState(null);

const handleViewTasks = async (member) => {
  try {
    const response = await axios.get(`https://telegram-miniappp.onrender.com/api/tasks/user/${member.id}`);
    const memberTasks = response.data.filter(task => task.team_id === selectedGroup.id);
    setTasks(memberTasks); // Cập nhật danh sách nhiệm vụ
    setSelectedMember(member); // Cập nhật thành viên được chọn
    setIsModalVisible(true); // Mở modal
  } catch (error) {
    console.error('Lỗi khi lấy nhiệm vụ đã giao:', error);
    antdMessage.error('Không thể lấy nhiệm vụ');
  }
};
const handleCancel = () => {
  setIsModalVisible(false); // Đóng modal
};
const handleOpenAssignTaskModal = (member) => {
  setSelectedMember(member);  // Lưu lại thành viên đang được giao nhiệm vụ
  setIsAssignTaskModalOpen(true);  // Mở modal giao nhiệm vụ
};
// sửa task
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
      setIsAssignTaskModalOpen(false); // Đóng modal sau khi sửa nhiệm vụ
      setNewTask({ title: '', description: '', status: 'pending', deadline: null });
      setSelectedTask(null); // Reset selected task
    } catch (error) {
      console.error('Lỗi khi cập nhật nhiệm vụ:', error);
      antdMessage.error('Cập nhật nhiệm vụ thất bại!');
    }
  };
  const handleEditTaskModal = (task) => {
    setSelectedTask(task); // Lưu lại nhiệm vụ cần sửa
    setNewTask({
      title: task.title,
      description: task.description,
      status: task.status,
      deadline: task.deadline ? dayjs(task.deadline) : null  // Chuyển deadline về dạng dayjs
    });
    setIsAssignTaskModalOpen(true); // Mở modal để chỉnh sửa
  };
// xóa task
  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`https://telegram-miniappp.onrender.com/api/tasks/delete/${taskId}`);
      antdMessage.success('Đã xóa nhiệm vụ');
      // Refresh danh sách nhiệm vụ sau khi xóa
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Lỗi khi xóa nhiệm vụ:', error);
      antdMessage.error('Không thể xóa nhiệm vụ');
    }
  };

  // Xóa thành viên khỏi nhóm
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
    <div style={{ padding: 24 }}>
      <Title level={3}><TeamOutlined /> Nhóm bạn đã tạo</Title>
      {adminGroups.length === 0 ? (
        <Empty description="Bạn chưa tạo nhóm nào. Hãy tạo nhóm mới!" style={{ marginTop: 50 }} />
      ) : (
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={adminGroups.slice().reverse()}
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

      <Modal
        title={`Chi tiết nhóm: ${selectedGroup?.name}`}
        open={isModalOpen}
        onCancel={closeModal}
        footer={<Button onClick={closeModal}>Đóng</Button>
      }
      >
        <Divider />
        <Title level={5}>Danh sách thành viên:</Title>
        {members.length === 0 ? (
          <Empty description="Không có thành viên nào." />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={members}
            renderItem={member => (
              <List.Item
                actions={[
                  <Button onClick={() => handleViewTasks(member)}>Xem nhiệm vụ</Button>,
                  <Button danger onClick={() => handleRemoveMember(member.id)}>Xóa</Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={member.name}
                  description={`Telegram ID: ${member.telegram_id}`}
                />
              </List.Item>
            )}
          />
        )}

        <Divider />
        <Title level={5}>Mời thêm thành viên</Title>
        <Space>
          <Input
            placeholder="Nhập Telegram ID"
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" onClick={handleInviteMember}>Mời</Button>
        </Space>
      </Modal>

      <Modal
        title={selectedTask ? 'Chỉnh sửa nhiệm vụ' : 'Giao nhiệm vụ mới'}
        open={isAssignTaskModalOpen}
        onCancel={() => {
          setIsAssignTaskModalOpen(false);
          setNewTask({ title: '', description: '', status: 'pending', deadline: null });
          setSelectedTask(null);
        }}
        onOk={selectedTask ? handleEditTask : handleAssignTask}
        okText={selectedTask ? 'Cập nhật' : 'Giao nhiệm vụ'}
        style={{ zIndex: 1100 }}
      >
        <Input
          placeholder="Tiêu đề nhiệm vụ"
          value={newTask.title}
          onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
          style={{ marginBottom: 10 }}
        />
        <Input.TextArea
          rows={4}
          placeholder="Mô tả nhiệm vụ"
          value={newTask.description}
          onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
          style={{ marginBottom: 10 }}
        />
        <DatePicker
          placeholder="Chọn hạn chót"
          value={newTask.deadline}
          onChange={(date) => setNewTask(prev => ({ ...prev, deadline: date }))}
          style={{ width: '100%' }}
        />
      </Modal>
      <Modal
      title={`Nhiệm vụ đã giao cho ${selectedMember?.name}`}
      open={isModalVisible}
      onCancel={handleCancel}
      footer={[
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenAssignTaskModal(selectedMember)}
        >
          Thêm nhiệm vụ
        </Button>
      ]}
    >
      {tasks.length === 0 ? (
        <Text>Chưa có nhiệm vụ nào.</Text>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <List
            dataSource={tasks}
            renderItem={task => (
              <List.Item
                actions={[
                  <Button
                    icon={<FormOutlined />}
                    onClick={() => handleEditTaskModal(task)}
                  >
                    Sửa nhiệm vụ
                  </Button>,
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Xóa nhiệm vụ
                  </Button>
                ]}
              >
                <Card>
                  <Title level={5}>{task.title}</Title>
                  <Text><strong>Mô tả:</strong> {task.description || 'Không có'}</Text><br />
                  <Text><strong>Trạng thái:</strong> <Tag color="blue">{task.status}</Tag></Text><br />
                  <Text><strong>Hạn chót:</strong> {task.deadline || 'Không có'}</Text>
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