export interface Log {
  _id: string;
  route: string;
  service: string;
  method: string;
  status: number;
  response_time: number;
  timestamp: string;
  user: string;
}
