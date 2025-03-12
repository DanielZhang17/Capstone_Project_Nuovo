// contexts/UserContext.js
import { createContext, useContext, useState, useEffect } from 'react';

// 创建用户上下文
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // 初始化用户信息
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    email: '',
    wishlist: [],
    followingBrands: [],
  });

  // 从后端获取用户信息，包括心愿单和关注的品牌
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user profile');

      const data = await response.json();
      setUserDetails({
        firstName: data.firstName,
        email: data.email,
        wishlist: data.wishlist || [],
        followingBrands: data.followingBrands || [],
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // 初次加载组件时调用 fetchUserProfile
  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <UserContext.Provider value={{ userDetails, setUserDetails, fetchUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

// 自定义 hook，简化使用 UserContext
export const useUser = () => {
  return useContext(UserContext);
};
