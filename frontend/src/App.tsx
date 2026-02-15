import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { CarsPage } from './pages/CarsPage';
import { ClientsPage } from './pages/ClientsPage';
import { DefectDetailsPage } from './pages/DefectDetailsPage';
import { DefectsPage } from './pages/DefectsPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/defects" element={<DefectsPage />} />
        <Route path="/defects/:id" element={<DefectDetailsPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/cars" element={<CarsPage />} />
        <Route path="*" element={<Navigate to="/appointments" replace />} />
      </Route>
    </Routes>
  );
}
