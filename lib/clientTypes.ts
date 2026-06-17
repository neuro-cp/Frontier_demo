export type ClientRow = {
  id: string;
  workspaceId: string;
  name: string;
  status: string;
  balance: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
};
