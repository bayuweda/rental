import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { paths } from "./routes/paths";

const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const MotorcyclesPage = lazy(() =>
  import("./pages/MotorcyclesPage").then((m) => ({ default: m.MotorcyclesPage }))
);
const CustomersPage = lazy(() =>
  import("./pages/CustomersPage").then((m) => ({ default: m.CustomersPage }))
);
const BookingsPage = lazy(() =>
  import("./pages/BookingsPage").then((m) => ({ default: m.BookingsPage }))
);
const CalendarPage = lazy(() =>
  import("./pages/CalendarPage").then((m) => ({ default: m.CalendarPage }))
);
const FaqPage = lazy(() =>
  import("./pages/FaqPage").then((m) => ({ default: m.FaqPage }))
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-500">Memuat halaman...</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path={paths.login} element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to={paths.dashboard} replace />} />
              <Route path={paths.dashboard} element={<DashboardPage />} />
              <Route path={paths.motorcycles} element={<MotorcyclesPage />} />
              <Route path={paths.customers} element={<CustomersPage />} />
              <Route path={paths.bookings} element={<BookingsPage />} />
              <Route path={paths.calendar} element={<CalendarPage />} />
              <Route path={paths.faq} element={<FaqPage />} />
              <Route path={paths.settings} element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;