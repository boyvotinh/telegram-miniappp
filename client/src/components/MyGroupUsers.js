import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyGroupUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Lấy thông tin người dùng hiện tại
      const telegramId = window.Telegram.WebApp.initDataUnsafe.user.id;
      const userResponse = await axios.get(`/api/users/me?telegram_id=${telegramId}`);
      setCurrentUser(userResponse.data);

      // Lấy danh sách thành viên
      const response = await axios.get('/api/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Không thể tải danh sách thành viên. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const response = await axios.post('/api/users/leave-group');
      if (response.data.success) {
        // Refresh danh sách thành viên sau khi rời nhóm
        fetchUsers();
        setShowLeaveConfirm(false);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      setError('Không thể rời nhóm. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh sách thành viên</h2>
        {currentUser && currentUser.role !== 'admin' && (
          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Rời nhóm
          </button>
        )}
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div>
          <div className="grid gap-4">
            {users.map((user) => (
              <div key={user.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-gray-600">{user.role || 'Thành viên'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal xác nhận rời nhóm */}
          {showLeaveConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                <h3 className="text-lg font-bold mb-4">Xác nhận rời nhóm</h3>
                <p className="mb-4">Bạn có chắc chắn muốn rời nhóm này không?</p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowLeaveConfirm(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleLeaveGroup}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Rời nhóm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyGroupUsers; 