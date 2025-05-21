import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 处理登录请求
export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '请提供邮箱和密码' },
        { status: 400 }
      );
    }

    // 调用实际后端API进行登录
    try {
      // 使用axios直接调用后端API
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      console.log(`[Login API] 尝试登录到后端 ${backendUrl}/auth/login`);

      const response = await axios.post(`${backendUrl}/auth/login`, { 
        email, 
        password 
      });

      // 从响应中获取用户和令牌信息
      const userData = response.data;
      
      if (!userData || !userData.user) {
        console.error('[Login API] 后端没有返回用户数据', userData);
        return NextResponse.json(
          { success: false, message: '登录失败，无效的用户数据' },
          { status: 401 }
        );
      }

      // 将后端角色名称映射为前端使用的格式
      const roleMapping: Record<string, 'ADMIN' | 'DOCTOR' | 'PATIENT'> = {
        'admin': 'ADMIN',
        'doctor': 'DOCTOR',
        'patient': 'PATIENT'
      };
      
      const role = roleMapping[userData.user.role?.toLowerCase()] || 'PATIENT';

      console.log('[Login API] 登录成功，获取到token:', userData.token);

      // 返回用户信息和token，供前端存储
      return NextResponse.json({
        success: true,
        message: '登录成功',
        user: {
          id: userData.user.id.toString(),
          email: userData.user.email,
          name: `${userData.user.firstName} ${userData.user.lastName}`,
          role: role,
          token: userData.token
        }
      });
    } catch (error: any) {
      console.error('[Login API] 认证错误:', error);
      // 添加更详细的错误日志
      if (error.response) {
        console.error('[Login API] 后端响应状态:', error.response.status);
        console.error('[Login API] 后端错误信息:', error.response.data);
      }
      
      return NextResponse.json(
        { success: false, message: '用户名或密码错误' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('[Login API] 服务器错误:', error);
    return NextResponse.json(
      { success: false, message: '内部服务器错误' },
      { status: 500 }
    );
  }
} 