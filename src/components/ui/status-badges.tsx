import { BOOKING_STATUS_META, MOTORCYCLE_STATUS_META } from "../../lib/constants";
import type { BookingStatus, MotorcycleStatus } from "../../types";
import { StatusBadge } from "./badge";

export function MotorcycleStatusBadge({ status }: { status: MotorcycleStatus }) {
  const meta = MOTORCYCLE_STATUS_META[status] ?? MOTORCYCLE_STATUS_META.inactive;
  return (
    <StatusBadge
      className={meta.badge}
      dotClassName={meta.dot}
      label={meta.label}
    />
  );
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const meta = BOOKING_STATUS_META[status] ?? BOOKING_STATUS_META.pending;
  return (
    <StatusBadge
      className={meta.badge}
      dotClassName={meta.dot}
      label={meta.label}
    />
  );
}