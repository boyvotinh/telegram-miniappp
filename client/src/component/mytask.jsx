import React from 'react';
import { List, Card, Typography, Empty } from 'antd';

const { Title, Text } = Typography;

function MyTasks({ tasks }) {
  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Danh sách nhiệm vụ</Title>

      {tasks.length === 0 ? (
        <Empty description="Không có nhiệm vụ nào." />
      ) : (
        <List
          itemLayout="vertical"
          size="large"
          dataSource={tasks}
          renderItem={(task) => (
            <List.Item key={task.id}>
              <Card title={task.title}>
                <Text><strong>Mô tả:</strong> {task.description}</Text><br />
                <Text type="secondary"><em>Nhóm: {task.groupName}</em></Text>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}

export default MyTasks;
