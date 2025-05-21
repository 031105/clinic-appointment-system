import { NextRequest, NextResponse } from 'next/server';

// 处理登出请求 - 前端已经使用localStorage，这个API可以简化
export async function POST(req: NextRequest) {
  try {
    // 由于我们已经移到前端存储，这个API现在只需返回一个成功标志
    // 前端会清除localStorage中的token
    return NextResponse.json({
      success: true,
      message: '请在前端清除localStorage中的token'
    });
  } catch (error) {
    console.error('登出错误:', error);
    return NextResponse.json(
      { success: false, message: '登出失败' },
      { status: 500 }
    );
  }
} 