// --- Types ---
export interface SignupParams {
  name?: string;
  email: string;
  password: string;
}
export interface LoginParams {
  email: string;
  password: string;
}
export interface VerifyParams {
  email: string;
  code: string;
  type: "email" | "password";
}
export interface ForgotPasswordParams {
  email: string;
}
export interface ResetPasswordParams {
  email: string;
  newPassword: string;
}

// export interface AuthResponse<T = any> {
//     data?: T;
//     error?: string;
//   }

export interface AuthResponse<T> {
  //all routes return a message and a status
  message: string;
  status: number;
  error?: string; //this is optional becouse not available in getSession route but  the rest of the route
  token?: string; // only in signin route
  user?: User; // in signup im returning the user object
  data?: Data; // in getSession im returning the session object
}

//this will be used on the frontend to display the response from the server
export type User = {
  role: string;
  email: string;
  id: string;
  name: string | null;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Session = {
  userId: string;
  id: string;
  createdAt: Date;
  expiresAt: Date;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
};
export type Data = {
  session: Session;
  user: User | null;
};

export interface SignupResponse {
  message: string;
  status: number;
  error?: string;
  user?: User;
}

export interface LoginResponse {
  message: string;
  status: number;
  error?: string;
  token?: string;
  data?: {
    // Login returns message and token inside data
    message: string;
    token: string;
  };
}

export interface VerifyResponse {
  message: string;
  status: number;
  error?: string;
  resetSessionId?: string;
}

export interface ForgotPasswordResponse {
  message: string;
  status: number;
  error?: string;
}

export interface ResetPasswordResponse {
  message: string;
  status: number;
  error?: string;
}

export interface GetSessionResponse {
  message: string;
  status: number;
  error?: string;
  data?: Data; // GetSession returns session and user inside data
}

export interface LogoutResponse {
  message: string;
  status: number;
  error?: string;
}
