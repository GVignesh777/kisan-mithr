import { Navigate } from "react-router-dom";
import useUserStore from "./useUserStore";

export default function RoleBasedRoute({ children, allowedRole }) {
    const user = useUserStore();
    const role = user?.user.role;
    console.log("role", role)

  if (!role) {
    return <Navigate to="/user-login" />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/error" />;
  }

  return children;
}
