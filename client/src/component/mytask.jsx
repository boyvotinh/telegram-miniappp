import React, { useState } from 'react';
import { List, Card, Typography, Empty, Space, Tag, Badge, Row, Col, Statistic, Progress, Modal, Button, Upload, message } from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  UploadOutlined,
  FileOutlined,
  PaperClipOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

function MyTasks({ tasks }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

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

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
    setFileList([]);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setFileList([]);
  };

  const handleSubmit = async () => {
    if (fileList.length === 0) {
      message.warning('Vui lòng chọn file để nộp');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj);
      formData.append('task_id', selectedTask.id);
      
      if (selectedTask.assigned_to) {
        formData.append('user_id', selectedTask.assigned_to);
      } else {
        message.error('Không tìm thấy thông tin người dùng cho nhiệm vụ này.');
        setUploading(false);
        return;
      }

      await axios.post('https://telegram-miniappp.onrender.com/api/submissions/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success('Nộp bài thành công!');
      handleCancel();
    } catch (error) {
      console.error('Lỗi khi nộp bài:', error);
      message.error('Không thể nộp bài. Vui lòng thử lại sau.');
    } finally {
      setUploading(false);
    }
  };

  const taskStats = getTaskStats(tasks);

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
              <FileTextOutlined /> Danh sách nhiệm vụ
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
              Theo dõi và quản lý nhiệm vụ của bạn
            </Text>
          </Col>
          <Col>
            <Statistic 
              value={tasks.length} 
              suffix="nhiệm vụ"
              valueStyle={{ color: 'white' }}
            />
          </Col>
        </Row>
      </div>

      {tasks.length === 0 ? (
        <Card style={{ 
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Empty 
            description="Không có nhiệm vụ nào." 
            style={{ margin: '50px 0' }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card style={{ 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
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
                  hoverable
                  onClick={() => handleTaskClick(task)}
                  style={{ 
                    borderRadius: 12,
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
                        <TeamOutlined />
                        <Text>
                          <Text strong>Nhóm:</Text> {task.groupName}
                        </Text>
                      </Space>

                      {task.submitted_files && task.submitted_files.length > 0 && (
                        <Space>
                          <PaperClipOutlined />
                          <Text>
                            <Text strong>File đã nộp:</Text> {task.submitted_files.length} file
                          </Text>
                        </Space>
                      )}
                    </Space>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        </Space>
      )}

      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Nộp file cho nhiệm vụ: {selectedTask?.title}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            loading={uploading}
            icon={<UploadOutlined />}
          >
            Nộp file
          </Button>
        ]}
        width={600}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong>Mô tả nhiệm vụ:</Text>
            <Paragraph>{selectedTask?.description || 'Không có mô tả'}</Paragraph>
          </div>

          <div>
            <Text strong>File đã nộp:</Text>
            {selectedTask?.submitted_files && selectedTask.submitted_files.length > 0 ? (
              <List
                size="small"
                dataSource={selectedTask.submitted_files}
                renderItem={file => (
                  <List.Item>
                    <Space>
                      <FileOutlined />
                      <Text>{file.name}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary">Chưa có file nào được nộp</Text>
            )}
          </div>

          <div>
            <Text strong>Nộp file mới:</Text>
            <Upload
              multiple
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              style={{ marginTop: 8 }}
            >
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </div>
        </Space>
      </Modal>
    </div>
  );
}

export default MyTasks;