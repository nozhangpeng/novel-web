import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const user = useStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    // Redirect to the login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
