export type Tohirol = {
  _id: string;
  tohirolNumber: number;
  totalTicket: number;
  gift?: string | null;
  status: string;
  isActive: boolean;
  createdDate: number;
  createdUser: string;
};

export type TohirolInput = {
  tohirolNumber: number;
  totalTicket: number;
  gift?: string;
  status?: string;
};
