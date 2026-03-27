import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getAllAdmins, addAdmin, removeAdmin, updateAdminRole } from '../../api/admin-auth';
import type { AdminUser, AdminRole } from '../../api/admin-auth';
import './AdminAdmins.css';

export default function AdminAdmins() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setIsLoading(true);
    try {
      const data = await getAllAdmins();
      setAdmins(data);
    } catch (err) {
      console.error('Error loading admins:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await addAdmin(newEmail, newName, newRole);
      if (result.success) {
        setMessage({ type: 'success', text: `已添加管理员: ${newEmail}` });
        setNewEmail('');
        setNewName('');
        setNewRole('admin');
        setShowAddForm(false);
        loadAdmins();
      } else {
        setMessage({ type: 'error', text: result.error || '添加失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '添加失败' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string, email: string) => {
    if (!confirm(`确定要移除管理员 ${email} 吗？`)) return;

    try {
      const result = await removeAdmin(adminId);
      if (result.success) {
        setMessage({ type: 'success', text: `已移除管理员: ${email}` });
        loadAdmins();
      } else {
        setMessage({ type: 'error', text: result.error || '移除失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '移除失败' });
    }
  };

  const handleRoleChange = async (adminId: string, role: AdminRole) => {
    try {
      const result = await updateAdminRole(adminId, role);
      if (result.success) {
        setMessage({ type: 'success', text: '角色已更新' });
        loadAdmins();
      } else {
        setMessage({ type: 'error', text: result.error || '更新失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '更新失败' });
    }
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return <span className="admin-badge badge-error">超级管理员</span>;
      case 'admin':
        return <span className="admin-badge badge-info">管理员</span>;
      case 'editor':
        return <span className="admin-badge badge-success">编辑员</span>;
    }
  };

  const defaultAdmin: AdminUser = {
    id: 'default',
    email: 'wmango@hotmail.com',
    name: 'Super Admin',
    role: 'super_admin',
    createdAt: '2026-03-27T00:00:00Z'
  };

  const displayAdmins = admins.length > 0 ? admins : [defaultAdmin];

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-header">
          <h1>👥 管理员管理</h1>
          <p>添加和管理系统管理员</p>
        </div>

        {message && (
          <div className={`admin-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="admin-card">
          <div className="card-header">
            <h2>管理员列表</h2>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? '取消' : '+ 添加管理员'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddAdmin} className="add-admin-form">
              <div className="form-row">
                <div className="admin-form-group">
                  <label>邮箱</label>
                  <input
                    type="email"
                    className="admin-input"
                    placeholder="admin@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>名称</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="管理员名称"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>角色</label>
                  <select
                    className="admin-select"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as AdminRole)}
                  >
                    <option value="admin">管理员</option>
                    <option value="editor">编辑员</option>
                  </select>
                </div>
                <div className="admin-form-group form-actions">
                  <label>&nbsp;</label>
                  <button
                    type="submit"
                    className="admin-btn admin-btn-success"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '添加中...' : '确认添加'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>加载管理员列表...</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>邮箱</th>
                  <th>名称</th>
                  <th>角色</th>
                  <th>添加时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {displayAdmins.map(admin => (
                  <tr key={admin.id}>
                    <td>
                      <strong>{admin.email}</strong>
                    </td>
                    <td>{admin.name}</td>
                    <td>
                      {admin.role === 'super_admin' ? (
                        getRoleBadge(admin.role)
                      ) : (
                        <select
                          className="admin-select role-select"
                          value={admin.role}
                          onChange={(e) => handleRoleChange(admin.id, e.target.value as AdminRole)}
                        >
                          <option value="admin">管理员</option>
                          <option value="editor">编辑员</option>
                        </select>
                      )}
                    </td>
                    <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                    <td>
                      {admin.role !== 'super_admin' && (
                        <button
                          className="admin-btn admin-btn-danger"
                          onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                        >
                          移除
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-card">
          <h2>角色说明</h2>
          <div className="roles-info">
            <div className="role-item">
              <span className="admin-badge badge-error">超级管理员</span>
              <p>拥有所有权限，可以管理其他管理员。默认: wmango@hotmail.com</p>
            </div>
            <div className="role-item">
              <span className="admin-badge badge-info">管理员</span>
              <p>可以管理内容、触发收集、修改配置，但不能管理其他管理员</p>
            </div>
            <div className="role-item">
              <span className="admin-badge badge-success">编辑员</span>
              <p>只能查看数据和触发内容收集，不能修改配置</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}