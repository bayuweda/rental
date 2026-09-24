import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBooking,
  createCustomer,
  createFaq,
  createMotorcycle,
  deleteBooking,
  deleteCustomer,
  deleteFaq,
  deleteMotorcycle,
  fetchBookings,
  fetchCustomers,
  fetchFaqs,
  fetchMotorcycles,
  updateBooking,
  updateBookingStatus,
  updateCustomer,
  updateFaq,
  updateMotorcycle,
} from "../lib/api";
import type {
  Booking,
  BookingStatus,
  Customer,
  Faq,
  Motorcycle,
} from "../types";

export const queryKeys = {
  motorcycles: ["motorcycles"] as const,
  customers: ["customers"] as const,
  bookings: ["bookings"] as const,
  faqs: ["faq"] as const,
};

/* ---------------- Motorcycles ---------------- */

export function useMotorcycles() {
  return useQuery({
    queryKey: queryKeys.motorcycles,
    queryFn: fetchMotorcycles,
  });
}

export function useCreateMotorcycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<Motorcycle>) => createMotorcycle(values),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.motorcycles }),
  });
}

export function useUpdateMotorcycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<Motorcycle> }) =>
      updateMotorcycle(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.motorcycles });
      qc.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}

export function useDeleteMotorcycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMotorcycle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.motorcycles }),
  });
}

/* ---------------- Customers ---------------- */

export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers,
    queryFn: fetchCustomers,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<Customer>) => createCustomer(values),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.customers }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<Customer> }) =>
      updateCustomer(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.customers });
      qc.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.customers }),
  });
}

/* ---------------- Bookings ---------------- */

export function useBookings() {
  return useQuery({
    queryKey: queryKeys.bookings,
    queryFn: fetchBookings,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<Booking>) => createBooking(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings });
      qc.invalidateQueries({ queryKey: queryKeys.motorcycles });
    },
  });
}

export function useUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<Booking> }) =>
      updateBooking(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings });
      qc.invalidateQueries({ queryKey: queryKeys.motorcycles });
    },
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      updateBookingStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings });
      qc.invalidateQueries({ queryKey: queryKeys.motorcycles });
    },
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings });
      qc.invalidateQueries({ queryKey: queryKeys.motorcycles });
    },
  });
}

/* ---------------- FAQ ---------------- */

export function useFaqs() {
  return useQuery({ queryKey: queryKeys.faqs, queryFn: fetchFaqs });
}

export function useCreateFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<Faq>) => createFaq(values),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.faqs }),
  });
}

export function useUpdateFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<Faq> }) =>
      updateFaq(id, values),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.faqs }),
  });
}

export function useDeleteFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFaq(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.faqs }),
  });
}