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
