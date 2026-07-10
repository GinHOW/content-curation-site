#!/bin/bash
# 将 course-gifs 上传到 Cloudflare R2 (caa bucket)
# 用法: ./scripts/upload-assets.sh

BUCKET="caa"
DIR="public/course-gifs"

if [ ! -d "$DIR" ]; then
  echo "❌ 目录不存在: $DIR"
  exit 1
fi

echo "📦 上传 $DIR → R2://$BUCKET/course-gifs/"

for file in "$DIR"/*; do
  filename=$(basename "$file")
  echo "  ↑ $filename"
  wrangler r2 object put "$BUCKET/course-gifs/$filename" --file="$file" --remote
done

echo "✅ 上传完成！"
