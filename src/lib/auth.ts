import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authClient } from './api';

// 定义用户角色类型
type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';

// 定义API响应中的用户类型
interface ApiUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role_name: string;
}

// 定义API响应类型
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: ApiUser;
}

// 角色映射，将后端返回的角色转换为前端需要的格式
const roleMapping: Record<string, UserRole> = {
  'admin': 'ADMIN',
  'doctor': 'DOCTOR',
  'patient': 'PATIENT'
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        try {
          // 使用新的authClient进行登录
          const response = await authClient.login({
            email: credentials.email, 
            password: credentials.password
          }) as LoginResponse;
          
          // 从响应中提取用户信息
          const { user } = response;
          
          if (!user) {
            throw new Error('Login failed');
          }

          // 将后端角色映射为前端角色格式
          const role = roleMapping[user.role_name.toLowerCase()] || 'PATIENT';

          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 