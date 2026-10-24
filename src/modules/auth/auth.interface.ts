export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  interests?: string[];
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IJwtPayload {
  userId: string;
  role: "user" | "admin";
}
