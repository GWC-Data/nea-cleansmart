import React, { useEffect, useState } from "react";
import { X, Search, Loader2, CheckCircle2 } from "lucide-react";
import { apiService } from "../../services/apiService";
import type { UserProfile } from "../../types/apiTypes";
import { toast } from "sonner";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: (user: UserProfile) => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserAdded,
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await apiService.getAllUserProfiles();
      setUsers(allUsers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (user: UserProfile) => {
    setAddingId(user.id);
    try {
      // Simulate API call to add user to org
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success(`${user.name} added to organization!`);
      onUserAdded(user);
    } finally {
      setAddingId(null);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2A3A]/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8EDF2] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#1A2A3A] tracking-tight">
              Add User
            </h2>
            <p className="text-xs text-[#8A9AA8] font-medium mt-0.5">
              Select a registered user to add to your organization
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#F5F7FA] transition-colors text-[#8A9AA8] hover:text-[#1A2A3A]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-[#E8EDF2] shrink-0">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AAB5]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#E8EDF2] text-sm font-medium text-[#1A2A3A] placeholder:text-[#A0AAB5] focus:outline-none focus:border-[#509CD1] transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin text-[#86B537]" size={24} />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#8A9AA8] font-medium">No users found.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5F7FA] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E8EDF2] text-[#1A2A3A] flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A2A3A]">
                        {user.name}
                      </p>
                      <p className="text-xs text-[#8A9AA8] font-medium">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddUser(user)}
                    disabled={addingId === user.id}
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-2 text-white cursor-pointer"
                    style={{ background: "#86B537" }}
                  >
                    {addingId === user.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
