"use client";

import { useState } from "react";
import { useStore, User } from "@/lib/store";
import { compressImage } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/button";
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Shield, 
  Upload, 
  PlusCircle, 
  UserPlus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle,
  AlertCircle,
  LogOut,
  Lock
} from "lucide-react";

export default function SettingsPage() {
  const currentUser = useStore((state) => state.currentUser);
  const users = useStore((state) => state.users);
  const createUser = useStore((state) => state.createUser);
  const updateUserRole = useStore((state) => state.updateUserRole);
  const updateUserProfileImage = useStore((state) => state.updateUserProfileImage);
  const deleteUser = useStore((state) => state.deleteUser);
  const changePassword = useStore((state) => state.changePassword);
  const logout = useStore((state) => state.logout);

  // Form states for creating new user
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');

  // Change password states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newProfilePassword, setNewProfilePassword] = useState("");
  const [confirmProfilePassword, setConfirmProfilePassword] = useState("");
  const [profilePasswordError, setProfilePasswordError] = useState<string | null>(null);
  const [profilePasswordSuccess, setProfilePasswordSuccess] = useState<string | null>(null);
  
  // Status states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!currentUser) return null;

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 200, 0.8);
        updateUserProfileImage(currentUser.username, compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setProfilePasswordError(null);
    setProfilePasswordSuccess(null);

    if (!newProfilePassword.trim()) {
      setProfilePasswordError("Password cannot be empty.");
      return;
    }

    if (newProfilePassword !== confirmProfilePassword) {
      setProfilePasswordError("Passwords do not match.");
      return;
    }

    changePassword(currentUser.username, newProfilePassword);
    setProfilePasswordSuccess("Password updated successfully!");
    setNewProfilePassword("");
    setConfirmProfilePassword("");
    setTimeout(() => {
      setProfilePasswordSuccess(null);
      setShowPasswordForm(false);
    }, 2000);
  };

  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!newUsername.trim() || !newPassword.trim()) {
      setErrorMsg("Username and password are required.");
      return;
    }

    const success = createUser(newUsername, newPassword, newRole, "");
    if (success) {
      setSuccessMsg(`Account for "${newUsername}" created successfully!`);
      setNewUsername("");
      setNewPassword("");
      setNewRole("user");
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg("Username already exists or is invalid.");
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-indigo-400" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile settings {currentUser.role === 'admin' && "and application user accounts"}.
        </p>
      </div>

      <div className={`grid grid-cols-1 ${currentUser.role === 'admin' ? 'lg:grid-cols-12' : 'max-w-2xl mx-auto w-full'} gap-8 items-start`}>
        
        {/* Profile Card Section */}
        <div className={currentUser.role === 'admin' ? 'lg:col-span-4 flex flex-col gap-6' : 'w-full flex flex-col gap-6'}>
          <GlassPanel className="p-6 md:p-8 bg-[#0c0d1c]/80 border-white/5 shadow-xl flex flex-col gap-6 items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600" />
            
            <div className="relative group mt-4">
              {currentUser.profileImage ? (
                <img 
                  src={currentUser.profileImage} 
                  alt="Profile" 
                  className="h-28 w-28 rounded-full border-2 border-indigo-500/40 object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-gradient-to-br from-indigo-600 to-purple-800 flex items-center justify-center border-2 border-indigo-500/40 shadow-lg text-4xl font-bold uppercase select-none text-indigo-100 transition-transform duration-300 group-hover:scale-105">
                  {currentUser.username.substring(0, 2)}
                </div>
              )}
              
              <label 
                htmlFor="profile-image-input" 
                className="absolute bottom-0 right-0 h-8 w-8 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-200"
                title="Upload Profile Image"
              >
                <Upload className="h-4 w-4 text-white" />
                <input 
                  id="profile-image-input" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleProfileImageUpload} 
                />
              </label>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <span className="font-semibold text-xl text-white break-all truncate max-w-full px-2">
                {currentUser.username}
              </span>
              <span className="inline-flex items-center gap-1.5 self-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400 border border-indigo-500/20">
                {currentUser.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                {currentUser.role}
              </span>
            </div>

            <div className="w-full h-px bg-white/5 my-2" />

            <div className="flex flex-col gap-2 w-full text-left bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Account Specifications</div>
              <div className="text-sm mt-1 text-white/80 flex items-center justify-between">
                <span>Directory Context:</span>
                <span className="text-xs font-serif text-muted-foreground">metamend/audit-builder</span>
              </div>
              <div className="text-sm text-white/80 flex items-center justify-between">
                <span>Storage Sync:</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/20">Supabase Connected</span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(!showPasswordForm);
                  setProfilePasswordError(null);
                  setProfilePasswordSuccess(null);
                }}
                className="w-full text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 transition-all cursor-pointer select-none"
              >
                <Lock className="h-3.5 w-3.5" />
                {showPasswordForm ? "Cancel Change Password" : "Change Password"}
              </button>

              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="flex flex-col gap-3 w-full bg-white/5 p-4 rounded-xl border border-white/5 text-left mt-2 animate-fade-in">
                  <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Update Security</div>
                  
                  {profilePasswordError && (
                    <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                      {profilePasswordError}
                    </div>
                  )}

                  {profilePasswordSuccess && (
                    <div className="text-xs text-green-400 bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                      {profilePasswordSuccess}
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide select-none">New Password</label>
                    <input 
                      type="password"
                      value={newProfilePassword}
                      onChange={(e) => setNewProfilePassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide select-none">Confirm Password</label>
                    <input 
                      type="password"
                      value={confirmProfilePassword}
                      onChange={(e) => setConfirmProfilePassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-sans"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold mt-1"
                  >
                    Update Password
                  </Button>
                </form>
              )}
            </div>

            <Button 
              onClick={logout}
              variant="secondary"
              className="w-full h-11 rounded-full text-white/70 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 transition-all border border-white/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </GlassPanel>
        </div>

        {/* Admin Section (List & Form) */}
        {currentUser.role === 'admin' && (
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Accounts Panel */}
            <GlassPanel className="p-6 md:p-8 bg-[#0c0d1c]/80 border-white/5 shadow-xl flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">User Accounts</h3>
                  <p className="text-sm text-muted-foreground">Monitor roles and manage authorizations.</p>
                </div>
              </div>

              <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20">
                <div className="grid grid-cols-12 px-6 py-4 bg-white/5 border-b border-white/5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-5">User</div>
                  <div className="col-span-4">Role</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>

                <div className="flex flex-col divide-y divide-white/5">
                  {Object.values(users).map((user: User) => (
                    <div 
                      key={user.username} 
                      className="grid grid-cols-12 px-6 py-4 items-center hover:bg-white/5 transition-colors"
                    >
                      <div className="col-span-5 flex items-center gap-3">
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt="Avatar" 
                            className="h-8 w-8 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-900/50 flex items-center justify-center border border-indigo-500/20 text-indigo-200 text-xs font-semibold uppercase select-none">
                            {user.username.substring(0, 2)}
                          </div>
                        )}
                        <span className="font-medium text-white truncate max-w-[200px]" title={user.username}>
                          {user.username}
                          {user.username === currentUser.username && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded ml-2 font-bold select-none border border-indigo-500/20 uppercase tracking-wide">You</span>
                          )}
                        </span>
                      </div>
                      
                      <div className="col-span-4">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wider ${
                          user.role === 'admin' 
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}>
                          {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                          {user.role}
                        </span>
                      </div>

                      <div className="col-span-3 flex justify-end gap-1">
                        {user.username !== currentUser.username ? (
                          <>
                            {user.role === 'admin' ? (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-full h-8 w-8 hover:bg-zinc-500/20 hover:text-zinc-300"
                                onClick={() => updateUserRole(user.username, 'user')}
                                title="Demote to User"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-full h-8 w-8 hover:bg-indigo-500/20 hover:text-indigo-400"
                                onClick={() => updateUserRole(user.username, 'admin')}
                                title="Promote to Admin"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full h-8 w-8 hover:bg-red-500/20 hover:text-red-400"
                              onClick={() => deleteUser(user.username)}
                              title="Delete Account"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic px-2">Managed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassPanel>

            {/* Create New User Panel */}
            <GlassPanel className="p-6 md:p-8 bg-[#0c0d1c]/80 border-white/5 shadow-xl flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-indigo-400" />
                  Register New Account
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">Register a new team member and configure their roles.</p>
              </div>

              {successMsg && (
                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm animate-fade-in">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm animate-shake">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegisterUser} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username / Email</label>
                  <input 
                    type="email" 
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="email@metamend.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-sans"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
                  <input 
                    type="text" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Set temporary password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-sans"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Role</label>
                  <select 
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
                    className="w-full bg-[#131429] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-sans h-11"
                  >
                    <option value="user">User (Standard Access)</option>
                    <option value="admin">Admin (Full Access & Templates)</option>
                  </select>
                </div>
                <Button 
                  type="submit"
                  className="bg-gradient-primary text-white border-0 shadow-lg shadow-indigo-500/20 rounded-full h-11 px-6 font-semibold"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create Account
                </Button>
              </form>
            </GlassPanel>

          </div>
        )}

      </div>
    </div>
  );
}
