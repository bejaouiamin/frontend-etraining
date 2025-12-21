// typescript
export interface CandidatRequest {
  id?: number;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}
