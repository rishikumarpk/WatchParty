import React from 'react';

interface User {
  id: string;
  display_name: string;
  avatar_id: string;
}

interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <div className="flex gap-2 p-4 overflow-x-auto">
      {users.map((u, idx) => (
        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-primary/20">
             <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${u.avatar_id}`} alt="avatar" />
          </div>
          <span className="text-sm font-medium text-textMain whitespace-nowrap">{u.display_name}</span>
        </div>
      ))}
    </div>
  );
};

export default UserList;
