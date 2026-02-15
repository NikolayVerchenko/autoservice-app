import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/appointments', label: 'Записи' },
  { to: '/defects', label: 'Дефектовки' },
  { to: '/clients', label: 'Клиенты' },
  { to: '/cars', label: 'Автомобили' },
  { to: '/settings', label: 'Настройки' },
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center">
        <h1 className="text-lg font-semibold">Панель автосервиса</h1>
      </header>
      <div className="flex">
        <aside className="w-56 border-r border-slate-200 bg-white min-h-[calc(100vh-56px)] p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded px-3 py-2 text-sm ${isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
