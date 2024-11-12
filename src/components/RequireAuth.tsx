import { Outlet, Navigate } from "react-router-dom";

interface RequireAuthProps {
  token: string;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ token }) => {
  return token ? <Outlet /> : <Navigate to={"/login"} replace={true} />;
};

export default RequireAuth;
