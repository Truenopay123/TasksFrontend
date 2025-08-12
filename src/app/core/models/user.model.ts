export interface Usuario {
  username: string;
  password: string;
}

export interface RespuestaAutenticacion {
  intData?: {
    token?: string;
    message?: string;
    data?: {
      qr_code?: string;
      secret?: string;
    };
    two_factor_enabled?: boolean;
  };
  statusCode?: number;
}
