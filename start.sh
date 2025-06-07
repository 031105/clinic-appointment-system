#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  诊所预约系统 - 启动脚本${NC}"
echo -e "${BLUE}======================================${NC}"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装. 请先安装 Node.js${NC}"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: npm 未安装. 请先安装 npm${NC}"
    exit 1
fi

# 获取当前脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 检查端口是否被占用
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        echo -e "${YELLOW}警告: 端口 $port 已被占用. 正在尝试关闭占用进程...${NC}"
        # 尝试关闭占用端口的进程
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
            echo -e "${RED}错误: 无法释放端口 $port. 请手动关闭占用进程${NC}"
            exit 1
        fi
        echo -e "${GREEN}端口 $port 已释放${NC}"
    fi
}

# 检查3001端口（后端）
check_port 3001 "后端"

# 检查3000端口（前端）
check_port 3000 "前端"

echo -e "${YELLOW}正在检查并安装依赖...${NC}"

# 安装根目录（前端）依赖
echo -e "${BLUE}安装前端依赖...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}前端依赖已存在${NC}"
fi

# 安装后端依赖
echo -e "${BLUE}安装后端依赖...${NC}"
cd server
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}后端依赖已存在${NC}"
fi

# 构建后端（如果需要）
echo -e "${BLUE}构建后端...${NC}"
npm run build

cd ..

# 确保系统设置数据存在
echo -e "${BLUE}确保系统设置数据存在...${NC}"
if command -v psql &> /dev/null; then
    # 如果psql可用，直接执行SQL文件
    if [ -f "setup-admin-settings.sql" ]; then
        echo -e "${YELLOW}正在设置系统设置数据...${NC}"
        # 这里需要根据实际的数据库连接信息调整
        # psql -d clinic_appointment_system -f setup-admin-settings.sql 2>/dev/null || true
        echo -e "${YELLOW}请手动执行 setup-admin-settings.sql 文件以设置系统设置${NC}"
    fi
else
    echo -e "${YELLOW}PostgreSQL客户端未找到，请手动执行以下SQL文件：${NC}"
    echo -e "  - setup-admin-settings.sql"
fi

# 创建日志目录
mkdir -p logs

# 函数：清理进程
cleanup() {
    echo -e "\n${YELLOW}正在关闭服务...${NC}"
    
    # 关闭前端进程（端口3000）
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    # 关闭后端进程（端口3001）
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}服务已关闭${NC}"
    exit 0
}

# 捕获 Ctrl+C 信号
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  启动服务中...${NC}"
echo -e "${GREEN}======================================${NC}"

# 启动后端服务器（端口3001）
echo -e "${BLUE}启动后端服务器 (端口 3001)...${NC}"
cd server
# 确保后端在3001端口启动
PORT=3001 npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# 等待后端启动
echo -e "${YELLOW}等待后端服务启动...${NC}"
sleep 5

# 检查后端是否成功启动
if ! lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null; then
    echo -e "${RED}错误: 后端服务启动失败${NC}"
    echo -e "${YELLOW}查看后端日志: tail -f logs/backend.log${NC}"
    exit 1
fi
echo -e "${GREEN}后端服务已在端口 3001 启动${NC}"

# 启动前端服务器（端口3000）
echo -e "${BLUE}启动前端服务器 (端口 3000)...${NC}"
# 确保前端在3000端口启动
PORT=3000 npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# 等待前端启动
echo -e "${YELLOW}等待前端服务启动...${NC}"
sleep 5

# 检查前端是否成功启动
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
    echo -e "${RED}错误: 前端服务启动失败${NC}"
    echo -e "${YELLOW}查看前端日志: tail -f logs/frontend.log${NC}"
    cleanup
    exit 1
fi
echo -e "${GREEN}前端服务已在端口 3000 启动${NC}"

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  服务启动完成！${NC}"
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}前端地址: ${BLUE}http://localhost:3000${NC}"
echo -e "${GREEN}后端地址: ${BLUE}http://localhost:3001${NC}"
echo -e "${GREEN}API文档: ${BLUE}http://localhost:3001/api/v1/health${NC}"
echo -e "${YELLOW}查看日志: ${NC}"
echo -e "  - 前端日志: tail -f logs/frontend.log"
echo -e "  - 后端日志: tail -f logs/backend.log"
echo -e "${YELLOW}按 Ctrl+C 停止所有服务${NC}"

# 保持脚本运行
wait 