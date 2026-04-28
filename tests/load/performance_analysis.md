# Load Test Result Analysis

## Executive Summary
The load test successfully simulated **500 concurrent users**, but **failed** its performance criteria due to a high error rate (**60.11%**). While the response times for successful requests were well within limits (P95 < 250ms), the system could not handle the volume of authentication requests.

## Key Metrics Breakdown

| Metric | Result | Target | Status |
| :--- | :--- | :--- | :--- |
| **HTTP Request Duration (P95)** | **245.78ms** | < 1000ms | ✅ PASSED |
| **HTTP Failure Rate** | **60.11%** | < 1% | ❌ FAILED |
| **Total Requests** | **34,763** | - | - |
| **Requests Per Second** | **112.33/s** | - | - |
| **Login Success Rate** | **0%** | - | ❌ CRITICAL |

## Detailed Findings

### 1. Connection Resets (`wsarecv: An existing connection...`)
Thousands of requests failed with "Connection forcibly closed by the remote host". This indicates the **Node.js/Express server** or the **OS** reached its connection limit.
- **Possible Cause**: Your backend is running with a default connection limit or doesn't have enough workers to handle 500 simultaneous TCP connections.
- **Node.js Context**: Node.js is single-threaded; even with the `cluster` module, $500$ VUs hitting a local machine can saturate the event loop when doing heavy tasks like password hashing (Bcrypt).

### 2. Login Check Failures (100% Fail)
The script reported **0% success** for login checks.
- **Cause**: The test was looking for `testuser@example.com` with `Password123!`. If this user isn't in your MongoDB database, the server returns 401/404, which the test marks as a failure.
- **Impact**: Since login failed, all subsequent "Cart" and "Checkout" operations also failed because they lacked a valid JWT token.

### 3. Browsing Performance
- **Product list (P95: 334ms)** and **Product details (P95: 198ms)** performed remarkably well. 
- These are "Read" operations. The fact that they survived while login failed suggests that the **Database Read** performance is good, but **Authentication/Writes** are the bottleneck.

## Action Plan to Fix Bottlenecks

### 1. Seed Test Data
The login failures are likely logical. Ensure a test user exists in your DB before running the test:
```javascript
// Seed this in your MongoDB
{
  "email": "testuser@example.com",
  "password": "Password123!", // Ensure it's hashed correctly in DB
  ...
}
```

### 2. Increase Resource Limits
Node.js default limits might be too low for 500 VUs on a single dev machine.
- Check if you have a **Rate Limiter** middleware (like `express-rate-limit`) that is blocking the load test.
- Increase the `UV_THREADPOOL_SIZE` for Bcrypt operations.

### 3. Optimization Suggestions
- **Bcrypt Rounds**: If you use Bcrypt for salt rounds, 500 users logging in at once causes heavy CPU spikes. Consider using a lower round count for test environments.
- **Token Caching**: If the server validates the token against the DB every time, use Redis to cache the session.
- **Connection Pooling**: Increase the `maxPoolSize` in your MongoDB connection string to handle more concurrent queries.
