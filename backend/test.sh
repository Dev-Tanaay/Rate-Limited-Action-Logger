#Run test.sh file to test 

URL="http://localhost:3000/api/action"
COOKIE="YOUR TOKEN"

echo "Step 1: Burst test (6 quick requests) — Fixed Window Limiter"

for i in {1..6}; do
  echo " Sending request $i..."
  curl -s -X POST $URL \
    -H "Content-Type: application/json" \
    -H "Cookie: $COOKIE" \
    -d '{"userId":1,"type":"UPLOAD","metaData":{"file":"burst_test.zip"}}'
  echo -e "\n Request $i sent"
done

echo -e "\n Waiting 65 seconds to reset window...\n"
sleep 65

echo " Step 2: Parallel token bucket test (5+1 long-running requests)"

# function to simulate slow request
send_slow_request() {
  curl -s -X POST $URL \
    -H "Content-Type: application/json" \
    -H "Cookie: $COOKIE" \
    -d '{"userId":1,"type":"UPLOAD","metaData":{"file":"token_bucket_test.zip"}}'
  echo -e "\n Done: PID $$"
}

# start 5 slow requests in parallel
for i in {1..5}; do
  send_slow_request &
done

sleep 1
echo -e "\n Sending 6th request (should hit token bucket limit)..."
send_slow_request

wait
echo -e "\n Test finished!"
