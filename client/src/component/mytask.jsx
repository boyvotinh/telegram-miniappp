import React from 'react';
import { List, Card, Typography, Empty, Space, Tag, Badge, Row, Col, Statistic, Progress } from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined,
  CalendarOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

function MyTasks({ tasks }) {
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

  const taskStats = getTaskStats(tasks);

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
        padding: '24px',
        borderRadius: '12px',
        color: 'white',
        marginBottom: '24px'
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
                    </Space>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        </Space>
      )}
    </div>
  );
}

export default MyTasks;