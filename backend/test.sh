for i in {1..6}; do
  curl -X POST http://localhost:3000/api/action \
    -H "Content-Type: application/json" \
    -d '{"userId":1,"type":"UPLOAD","metaData":{"file":"test.zip"}}'
  echo "\n--- Request $i sent ---"
done