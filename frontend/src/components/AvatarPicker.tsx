import React from 'react';

interface AvatarPickerProps {
  selectedAvatar: string;
  onSelect: (avatar: string) => void;
}

const avatars = [
  'avatar_1',
  'avatar_2',
  'avatar_3',
  'avatar_4',
  'avatar_5'
];

const AvatarPicker: React.FC<AvatarPickerProps> = ({ selectedAvatar, onSelect }) => {
  return (
    <div className="flex justify-between mt-4 mb-6">
      {avatars.map((avatar) => (
        <button
          key={avatar}
          type="button"
          onClick={() => onSelect(avatar)}
          className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-transform ${selectedAvatar === avatar
              ? 'border-primary scale-110 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
              : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
            }`}
        >
          <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatar}`} alt={avatar} />
        </button>
      ))}
    </div>
  );
};

export default AvatarPicker;
