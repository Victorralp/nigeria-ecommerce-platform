import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';

export function SecretAdminAccess() {
  const navigate = useNavigate();
  const { adminUser, isAuthenticated } = useAdminAuth();
  const [keys, setKeys] = useState<string[]>([]);
  const secretCode = ['b', 'o', 'l', 't']; // Secret code: type "bolt"

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!event.key) return; // Guard against undefined key

      if (event.altKey && event.shiftKey && event.key === 'A') {
        // Alt + Shift + A shortcut
        if (isAuthenticated && adminUser) {
          navigate('/admin/dashboard');
        } else {
          navigate('/bolt-admin');
        }
        return;
      }

      const newKeys = [...keys, event.key.toLowerCase()];
      if (newKeys.length > secretCode.length) {
        newKeys.shift(); // Remove the oldest key
      }
      setKeys(newKeys);

      if (newKeys.join('') === secretCode.join('')) {
        if (isAuthenticated && adminUser) {
          navigate('/admin/dashboard');
        } else {
          navigate('/bolt-admin');
        }
        setKeys([]); // Reset the keys
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate, keys, isAuthenticated, adminUser]);

  return null;
} 