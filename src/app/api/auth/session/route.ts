import { NextRequest, NextResponse } from 'next/server';

// 处理获取会话请求 - 前端已经使用localStorage，这个API可以简化
export async function GET(req: NextRequest) {
  try {
    // 由于我们已经移到前端存储，这个API现在只需返回一个成功标志
    // 前端会从localStorage中获取用户信息
    return NextResponse.json({
      success: true,
      message: '请从localStorage获取用户信息'
    });
  } catch (error) {
    console.error('获取会话错误:', error);
    return NextResponse.json(
      { success: false, message: '获取会话失败' },
      { status: 500 }
    );
  }
} 