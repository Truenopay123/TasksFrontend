export interface Task {
  id?: string; // Cambiado de number a string para coincidir con ObjectId
  name: string;
  description: string;
  created_at: string; // Formato YYYY-MM-DD
  dead_line: string;  // Formato YYYY-MM-DD
  status: string;
  is_alive: boolean;
  created_by: string;
}

export interface RespuestaTareasLista {
  statusCode: number;
  intData?: {
    message: string;
    data?: Task[]; // Arreglo de tareas para listar
  };
}

export interface RespuestaTareasDetalle {
  statusCode: number;
  intData?: {
    message: string;
    data: Task; // Una sola tarea para detalle
  };
}

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

