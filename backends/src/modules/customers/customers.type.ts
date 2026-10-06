export interface CreateCustomerInput {
  fullName: string;
  phone: string;
  email: string;
  address?: string;
}

export interface UpdateCustomerInput {
  customerId: number;
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
}
