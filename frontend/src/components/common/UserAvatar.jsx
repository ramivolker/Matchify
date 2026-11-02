import React, { useState, useEffect } from 'react';
import { getUserAvatar } from '../../utils/userAvatarUtils';

export default function UserAvatar({
  user,
  size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl', 'hero'
  className = '',
  customAvatar = null, // para previsualizar antes de guardar
  alt = 'Avatar',
}) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = customAvatar ?? getUserAvatar(user);

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const initials = `${user?.nombre?.charAt(0) || 'U'}${user?.apellido?.charAt(0) || ''}`.toUpperCase();

  const sizeClasses = {
    xs: 'avatar-size-xs',
    sm: 'avatar-size-sm',
    md: 'avatar-size-md',
    lg: 'avatar-size-lg',
    xl: 'avatar-size-xl',
    hero: 'avatar-size-hero',
  };

  const selectedSizeClass = sizeClasses[size] || sizeClasses.md;

  if (avatarUrl && !imgError) {
    return (
      <div className={`user-avatar-wrapper ${selectedSizeClass} ${className}`}>
        <img
          src={avatarUrl}
          alt={alt || `${user?.nombre || 'Usuario'}`}
          className="user-avatar-img"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={`user-avatar-wrapper ${selectedSizeClass} user-avatar-initials ${className}`}>
      <span>{initials}</span>
    </div>
  );
}
