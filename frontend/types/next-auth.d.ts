import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string
    name: string
    accessToken: string
  }

  interface Session {
    user: User
    accessToken: string
    userId: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    userId?: string
  }
}
