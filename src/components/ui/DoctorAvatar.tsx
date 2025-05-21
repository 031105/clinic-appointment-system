import React from 'react';

// 生成医生图片URL的辅助函数
function getDoctorImageUrl(doctorId: number): string {
  // 使用正确的完整后端API URL
  return `http://localhost:3001/api/v1/users/profile-image/${doctorId}`;
}

// 医生头像组件 - 支持API图片获取和回退
interface DoctorAvatarProps {
  className?: string;
  userId?: number;
}

export function DoctorAvatar({ className = '', userId }: DoctorAvatarProps) {
  return (
    <div className={`bg-blue-100 flex items-center justify-center overflow-hidden ${className}`}>
      {userId ? (
        <img 
          src={getDoctorImageUrl(userId)} 
          alt="Doctor's profile" 
          className="w-full h-full object-cover"
          onError={(e) => {
            // 图片加载失败时回退到默认SVG
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.setAttribute('style', 'display: block');
          }}
        />
      ) : null}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className="w-1/2 h-1/2 text-blue-500"
        style={userId ? {display: 'none'} : {}}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    </div>
  );
} 