#!/bin/bash
# UniApp 微信小程序编译后置处理脚本
# 功能：将 static 文件夹复制到 mp-weixin 编译输出目录
#
# 使用方法：
#   在 HBuilderX 中：运行 → 外部命令配置 → 添加此脚本
#   每次编译完成后自动执行，或手动执行：bash post-compile.sh

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
WX_OUTPUT="$PROJECT_DIR/unpackage/dist/dev/mp-weixin"

echo "==> 开始后置处理..."

# 复制 static 文件夹
if [ -d "$PROJECT_DIR/static" ]; then
    echo "==> 复制 static 文件夹到 mp-weixin 输出目录"
    cp -rf "$PROJECT_DIR/static" "$WX_OUTPUT/"
    echo "==> static 复制完成"
else
    echo "==> 警告: static 文件夹不存在"
fi

echo "==> 后置处理完成！"
