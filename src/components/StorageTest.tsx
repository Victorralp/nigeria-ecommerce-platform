import { useState } from 'react';
import { testStorageConnection } from '@/services/storage';
import { toast } from 'react-hot-toast';

export function StorageTest() {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleTestConnection = async () => {
    setIsChecking(true);
    try {
      const response = await testStorageConnection();
      setResult(response.message);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to test storage connection';
      setResult(message);
      toast.error(message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleTestConnection}
        disabled={isChecking}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isChecking ? 'Checking...' : 'Test Storage Connection'}
      </button>
      {result && (
        <div className="mt-4 p-4 rounded border">
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
} 