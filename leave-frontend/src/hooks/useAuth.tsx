import { useEffect, useState } from "react";
import { isAuthenticated } from "../auth";

const useAuth = () => {
  const [isLogin, setIsLogin] = useState(isAuthenticated());

  useEffect(() => {
    const handleStorage = () => {
      setIsLogin(isAuthenticated());
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return isLogin;
};

export default useAuth;
