// Shared types used across the app.

export type ServiceStatus = "active" | "inactive";

export type Service = {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number; // minutes
  image: string;
  status: ServiceStatus;
  createdAt: string;
};

export type CategoryInfo = {
  name: string;
  count: number;
};

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

// Appointment + the joined service/customer info the dashboards display.
export type Appointment = {
  _id: string;
  serviceId: string;
  customerId?: string;
  appointmentDate: string; // ISO string
  timeSlot: string;
  message?: string;
  servicePrice: number;
  paymentStatus: "unpaid" | "paid";
  status: AppointmentStatus;
  createdAt: string;
  service?: {
    serviceName?: string;
    image?: string;
    category?: string;
    duration?: number;
  };
  customer?: {
    name?: string;
    email?: string;
    image?: string | null;
  };
};

export type AdminStats = {
  totalAppointments: number;
  statusCounts: Record<AppointmentStatus, number>;
  revenue: number;
  totalCustomers: number;
  totalServices: number;
  recentAppointments: Appointment[];
};
