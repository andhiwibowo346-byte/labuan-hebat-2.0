import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Wrench,
  Eye,
  Search,
  KeyRound,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Building,
  IdCard,
  Lock,
  User,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserRole } from '../../types';

export const UserManagerView: React.FC = () => {
  const {
    usersList,
    currentUser,
    createUser,
    updateUser,
    deleteUser,
    hasPermission,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPwdModalOpen, setIsResetPwdModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Form states for Add User
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('it_admin');
  const [department, setDepartment] = useState('Information Technology');
  const [password, setPassword] = useState('admin123');
  const [avatar, setAvatar] = useState('');

  // Form states for Edit User
  const [editName, setEditName] = useState('');
  const [editNip, setEditNip] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('it_admin');
  const [editDepartment, setEditDepartment] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');

  // Reset password state
  const [newPassword, setNewPassword] = useState('');

  // Feedback notifications
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3500);
  };

  const handleOpenAdd = () => {
    setName('');
    setNip('');
    setEmail('');
    setRole('it_admin');
    setDepartment('Information Technology');
    setPassword('admin123');
    setAvatar('');
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showAlert('error', 'Nama dan Email wajib diisi.');
      return;
    }

    const res = createUser({
      name: name.trim(),
      nip: nip.trim() || undefined,
      email: email.trim(),
      role,
      department: department.trim() || 'IT',
      password: password || 'admin123',
      avatar: avatar.trim() || undefined,
      status: 'active',
    });

    if (res.success) {
      showAlert('success', res.message);
      setIsAddModalOpen(false);
    } else {
      showAlert('error', res.message);
    }
  };

  const handleOpenEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditNip(user.nip || '');
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditDepartment(user.department || '');
    setEditStatus(user.status || 'active');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const res = updateUser(selectedUser.id, {
      name: editName.trim(),
      nip: editNip.trim() || undefined,
      email: editEmail.trim(),
      role: editRole,
      department: editDepartment.trim(),
      status: editStatus,
    });

    if (res.success) {
      showAlert('success', res.message);
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } else {
      showAlert('error', res.message);
    }
  };

  const handleOpenResetPwd = (user: UserProfile) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsResetPwdModalOpen(true);
  };

  const handleResetPwdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!newPassword || newPassword.length < 6) {
      showAlert('error', 'Kata sandi minimal 6 karakter.');
      return;
    }

    const res = updateUser(selectedUser.id, { password: newPassword });
    if (res.success) {
      showAlert('success', `Kata sandi untuk ${selectedUser.name} berhasil diubah.`);
      setIsResetPwdModalOpen(false);
      setSelectedUser(null);
    } else {
      showAlert('error', res.message);
    }
  };

  const handleDelete = (user: UserProfile) => {
    if (user.id === currentUser?.id) {
      showAlert('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${user.name}"?`)) {
      const res = deleteUser(user.id);
      if (res.success) {
        showAlert('success', res.message);
      } else {
        showAlert('error', res.message);
      }
    }
  };

  const roleMeta: Record<UserRole, { label: string; icon: any; badgeClass: string }> = {
    super_admin: {
      label: 'Super Admin',
      icon: ShieldCheck,
      badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    },
    it_admin: {
      label: 'Admin IT',
      icon: ShieldCheck,
      badgeClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
    },
    technician: {
      label: 'Teknisi IT',
      icon: Wrench,
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    },
    viewer: {
      label: 'Viewer',
      icon: Eye,
      badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
    },
  };

  // Filter users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.nip && u.nip.includes(searchQuery)) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const canManageUsers = hasPermission('manage_users');

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Manajemen Pengguna Sistem
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              {usersList.length} Akun
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola akun pengguna aplikasi, hak akses (RBAC), kredensial login, dan departemen.
          </p>
        </div>

        {canManageUsers && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pengguna Baru</span>
          </button>
        )}
      </div>

      {/* Alert Notification */}
      {alert && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in ${
            alert.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Pengguna</span>
            <Users className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {usersList.length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Super Admin</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {usersList.filter((u) => u.role === 'super_admin').length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Admin IT</span>
            <ShieldCheck className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
            {usersList.filter((u) => u.role === 'it_admin').length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Teknisi IT</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {usersList.filter((u) => u.role === 'technician').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, email, PN, atau departemen..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'super_admin', 'it_admin', 'technician', 'viewer'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 capitalize ${
                roleFilter === r
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {r === 'all' ? 'Semua Peran' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Email Login</th>
                <th className="py-3 px-4">Hak Akses (Role)</th>
                <th className="py-3 px-4">Departemen</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data pengguna yang cocok.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const meta = roleMeta[user.role];
                  const Icon = meta.icon;
                  const isCurrent = user.id === currentUser?.id;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {user.name}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-brand-500/20 text-brand-600 dark:text-brand-400">
                                  Anda
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              PN: {user.nip || '-'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {user.email}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${meta.badgeClass}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{meta.label}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {user.department || '-'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            user.status !== 'inactive'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status !== 'inactive' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {user.status !== 'inactive' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canManageUsers && (
                            <>
                              <button
                                onClick={() => handleOpenResetPwd(user)}
                                title="Ganti Kata Sandi"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(user)}
                                title="Edit Pengguna"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {!isCurrent && (
                                <button
                                  onClick={() => handleDelete(user)}
                                  title="Hapus Akun"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: TAMBAH PENGGUNA BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Tambah Pengguna Baru
                  </h3>
                  <p className="text-xs text-slate-400">
                    Buat akun login baru dengan hak akses yang ditentukan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Rian Hidayat"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PN (Personal Number)
                  </label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="00385630"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Perusahaan *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rian.hidayat@perusahaan.co.id"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hak Akses (Role) *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="it_admin">Admin IT (Kelola Aset & Data)</option>
                    <option value="technician">Teknisi IT (Maintenance & Servis)</option>
                    <option value="viewer">Viewer (Read-only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Departemen
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="IT Support"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Awal *
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PENGGUNA */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Ubah Data Pengguna
                  </h3>
                  <p className="text-xs text-slate-400">
                    Perbarui profil, hak akses role, dan status akun.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PN (Personal Number)
                  </label>
                  <input
                    type="text"
                    value={editNip}
                    onChange={(e) => setEditNip(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Perusahaan *
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hak Akses *
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="it_admin">Admin IT</option>
                    <option value="technician">Teknisi IT</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Departemen
                  </label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Akun
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET KATA SANDI */}
      {isResetPwdModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Ganti Kata Sandi
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Untuk user: <strong>{selectedUser.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsResetPwdModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPwdSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Baru *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetPwdModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  Perbarui Kata Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
