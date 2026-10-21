#!/usr/bin/env bash
# 将本机交叉编译的 Linux 二进制部署到测试机（LG-10）。
# 用法（在仓库根目录）:
#   bash scripts/deploy-test-server.sh root@47.121.128.119
# 需已配置 SSH 密钥，或自行改用 sshpass。
set -euo pipefail

HOST="${1:-root@47.121.128.119}"
REMOTE_DIR="${REMOTE_DIR:-/www/wwwroot/new-api}"
LOCAL_BIN="${LOCAL_BIN:-./new-api-linux-amd64}"

if [[ ! -f "$LOCAL_BIN" ]]; then
  echo "missing $LOCAL_BIN — build first:"
  echo "  set GOOS=linux GOARCH=amd64 CGO_ENABLED=0"
  echo "  go build -o new-api-linux-amd64 ."
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
echo "==> backup + upload to $HOST:$REMOTE_DIR"
ssh "$HOST" "mkdir -p '$REMOTE_DIR/logs' && cd '$REMOTE_DIR' && if [[ -f new-api ]]; then cp -a new-api new-api.bak.$STAMP; fi"
scp "$LOCAL_BIN" "$HOST:$REMOTE_DIR/new-api.new"
ssh "$HOST" "cd '$REMOTE_DIR' && chmod +x new-api.new && mv new-api.new new-api && (pkill -f '[.]/new-api' || true); sleep 1; nohup ./new-api --log-dir ./logs > ./logs/nohup.out 2>&1 & sleep 2; curl -sS http://127.0.0.1:3000/api/status; echo"
echo "==> done. Public smoke: https://suiyuanai.cn/api/status (after DNS/SSL) or https://modelrec.net/api/status"
