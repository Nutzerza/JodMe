// Types for authentication forms and session user
export type RegisterFormValues = {
  username: string;
  email: string;
  password: string;
  confirm: string;
};

export type LoginFormValues = {
  identify: string; // email or username
  password: string;
};

export type ResetPasswordFormValues = {
  password: string;
  confirm: string;
};

export type SessionUser = {
  user?: {
    id: string;
    uid: string;
    username?: string | null;
    email?: string | null;
    image?: string | null;
  };
};
