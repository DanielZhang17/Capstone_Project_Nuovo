import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";

// Custom hook to check whether a user is logged out, a User or an a Admin
const useAuth = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: any = jwt.decode(token);
        setUserRole(decodedToken?.role);  // Set user role
      } catch (error) {
        setUserRole(null);  // Set to logged out if decoding fails
      }
    } else {
      setUserRole(null);  // No token means logged out
    }
  }, []);
  return userRole;  // Return the user's role
};

export default useAuth;
