#!/bin/bash
# 两个 AI 互相对话脚本
# PM AI 提需求 → Dev AI 实现 → PM review → 循环

ROUNDS=${1:-3}  # 默认跑3轮，可传参数改变 e.g. ./ai_loop.sh 5

PM_SYSTEM="你是一个资深产品经理。你的任务是：针对一个日语五十音记忆小程序，提出具体的功能需求或改进建议，并对程序员的方案进行 review。回复要简洁，不超过150字。"

DEV_SYSTEM="你是一个微信小程序开发者。你的任务是：根据产品经理的需求，给出具体的技术实现方案（伪代码或关键逻辑描述）。回复要简洁，不超过150字。"

FIRST_MSG="我们要给五十音图记忆闪卡小程序增加一个「错题本」功能，用户可以专项复习错误次数最多的假名。请给出需求细节。"

MESSAGE="$FIRST_MSG"

echo "================================================"
echo "  五十音小程序 AI 协作对话"
echo "  共 $ROUNDS 轮"
echo "================================================"
echo ""

for i in $(seq 1 $ROUNDS); do
  echo "──── 第 $i 轮 ────"
  echo ""

  # PM 说话
  echo "[PM 思考中...]"
  PM_REPLY=$(echo "$MESSAGE" | claude -p --append-system-prompt "$PM_SYSTEM" 2>&1)
  echo "[PM]: $PM_REPLY"
  echo ""

  # Dev 读取 PM 的输出并回复
  echo "[Dev 思考中...]"
  DEV_REPLY=$(echo "$PM_REPLY" | claude -p --append-system-prompt "$DEV_SYSTEM" 2>&1)
  echo "[Dev]: $DEV_REPLY"
  echo ""

  # Dev 的输出成为下一轮 PM 的输入
  MESSAGE="$DEV_REPLY"
done

echo "================================================"
echo "  对话结束"
echo "================================================"
