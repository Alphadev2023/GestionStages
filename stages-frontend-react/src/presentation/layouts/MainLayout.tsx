import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export function MainLayout({ title }: { title: string }) {
  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title={title} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </>
  );
}