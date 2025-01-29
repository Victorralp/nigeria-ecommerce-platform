import { StorageTest } from '@/components/StorageTest';

export function AdminSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Storage Settings</h2>
        <StorageTest />
      </div>
    </div>
  );
} 