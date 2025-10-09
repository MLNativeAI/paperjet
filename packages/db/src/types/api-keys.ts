export type ApiKey = {
  id: string;
  name: string | null;
  key: string;
  userId: string;
  enabled: boolean;
  createdAt: string;
  lastRequest: string | null;
};
