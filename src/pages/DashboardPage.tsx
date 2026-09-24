import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Bike,
  CalendarCheck2,
  CarFront,
  CircleDollarSign,
  Clock,
  Users,
  Wrench,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useBookings, useCustomers, useMotorcycles } from "../hooks/useData";
import {
  computeMonthlyValues,
  computeMotorStatusDistribution,
  computeStats,
} from "../lib/stats";
import { paths } from "../routes/paths";
import { formatIDR, formatDate } from "../lib/utils";
import {
  BOOKING_STATUS_META,
  BOOKING_STATUSES,
  MOTORCYCLE_STATUS_META,
} from "../lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { LoadingState } from "../components/ui/spinner";
import { EmptyState, ErrorState } from "../components/ui/states";
import { BookingStatusBadge, MotorcycleStatusBadge } from "../components/ui/status-badges";
import type { MotorcycleStatus } from "../types";

const MOTOR_PIE_COLORS: Record<MotorcycleStatus, string> = {
  available: "#10b981",
  rented: "#3b82f6",
  maintenance: "#f59e0b",
  inactive: "#94a3b8",
};

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tone?: "default" | "green" | "blue" | "amber" | "violet" | "red";
}) {
  const tones: Record<string, string> = {
    default: "bg-slate-100 text-slate-600",
    green: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    violet: "bg-violet-100 text-violet-600",
    red: "bg-red-100 text-red-600",
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-0.5 text-xl font-semibold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const motorcyclesQuery = useMotorcycles();
  const bookingsQuery = useBookings();
  const customersQuery = useCustomers();

  const isLoading =
    motorcyclesQuery.isLoading || bookingsQuery.isLoading || customersQuery.isLoading;
  const hasError =
    motorcyclesQuery.isError || bookingsQuery.isError || customersQuery.isError;
  const errorMessage =
    motorcyclesQuery.error?.message ??
    bookingsQuery.error?.message ??
    customersQuery.error?.message ??
    "Terjadi kendala saat mengambil data.";

  const stats = useMemo(() => {
    const motorcycles = motorcyclesQuery.data ?? [];
    const bookings = bookingsQuery.data ?? [];
    const customers = customersQuery.data ?? [];
    return computeStats(motorcycles, bookings, customers);
  }, [motorcyclesQuery.data, bookingsQuery.data, customersQuery.data]);

  const bookingsByStatus = useMemo(() => {
    const bookings = bookingsQuery.data ?? [];
    return BOOKING_STATUSES.map((status) => ({
      status,
      label: BOOKING_STATUS_META[status].label,
      count: bookings.filter((b) => b.status === status).length,
    }));
  }, [bookingsQuery.data]);

  const motorDistribution = useMemo(() => {
    const counts = computeMotorStatusDistribution(motorcyclesQuery.data ?? []);
    return (Object.keys(counts) as MotorcycleStatus[]).map((status) => ({
      status,
      label: MOTORCYCLE_STATUS_META[status].label,
      value: counts[status],
      color: MOTOR_PIE_COLORS[status],
    }));
  }, [motorcyclesQuery.data]);

  const monthlyValues = useMemo(
    () => computeMonthlyValues(bookingsQuery.data ?? []),
    [bookingsQuery.data]
  );

  const recentBookings = (bookingsQuery.data ?? []).slice(0, 5);

  if (isLoading) return <LoadingState label="Menyiapkan ringkasan bisnis..." />;
  if (hasError) return <ErrorState message={errorMessage} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan kondisi bisnis rental motor Anda.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total Motor" value={stats.totalMotorcycles} icon={Bike} tone="blue" />
        <StatCard label="Motor Tersedia" value={stats.available} icon={Bike} tone="green" />
        <StatCard label="Motor Disewa" value={stats.rented} icon={Bike} tone="violet" />
        <StatCard label="Perawatan" value={stats.maintenance} icon={Wrench} tone="amber" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard label="Total Customer" value={stats.totalCustomers} icon={Users} />
        <StatCard label="Booking Pending" value={stats.pendingBookings} icon={Clock} tone="amber" />
        <StatCard label="Booking Confirmed" value={stats.confirmedBookings} icon={CalendarCheck2} tone="blue" />
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard label="Booking Aktif" value={stats.activeBookings} icon={CarFront} tone="violet" />
        <Card className="lg:col-span-2">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total Nilai Booking
              </p>
              <p className="mt-0.5 text-xl font-semibold text-slate-900 sm:text-2xl">
                {formatIDR(stats.totalValue)}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Jumlah dari seluruh booking yang belum dibatalkan (belum tentu sudah dibayar).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking per Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={bookingsByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [value, "Jumlah booking"]}
                  cursor={{ fill: "#f8fafc" }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status Motor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={motorDistribution}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {motorDistribution.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nilai Booking per Bulan</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyValues}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) =>
                  v >= 1000000
                    ? `${(v / 1000000).toFixed(1)}jt`
                    : v >= 1000
                      ? `${(v / 1000).toFixed(0)}rb`
                      : String(v)
                }
              />
              <Tooltip
                formatter={(value) => [formatIDR(Number(value)), "Nilai booking"]}
                cursor={{ fill: "#f8fafc" }}
              />
              <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Booking Terbaru</CardTitle>
            <Link
              to={paths.bookings}
              className="rounded-lg px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Lihat semua
            </Link>
          </CardHeader>
          {recentBookings.length === 0 ? (
            <CardContent>
              <EmptyState
                title="Belum ada booking"
                description="Booking akan muncul di sini setelah data masuk dari dashboard atau chatbot."
              />
            </CardContent>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Motor</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium text-slate-900">
                      {booking.customers?.name ?? "-"}
                    </TableCell>
                    <TableCell>{booking.motorcycles?.name ?? "-"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                    </TableCell>
                    <TableCell>{formatIDR(booking.total_price)}</TableCell>
                    <TableCell>
                      <BookingStatusBadge status={booking.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Motor</CardTitle>
          </CardHeader>
          {(motorcyclesQuery.data ?? []).length === 0 ? (
            <CardContent>
              <EmptyState
                title="Belum ada motor"
                description="Data motor dari tabel motorcycles akan tampil di sini."
              />
            </CardContent>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Motor</TableHead>
                    <TableHead>Plat</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(motorcyclesQuery.data ?? []).map((motor) => (
                    <TableRow key={motor.id}>
                      <TableCell className="font-medium text-slate-900">
                        {motor.name}
                      </TableCell>
                      <TableCell>{motor.license_plate ?? "-"}</TableCell>
                      <TableCell>{formatIDR(motor.price_per_day)}/hari</TableCell>
                      <TableCell>
                        <MotorcycleStatusBadge status={motor.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}