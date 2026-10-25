import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 5,
  duration: "30s",
  thresholds: {
    "http_req_failed{endpoint:profile}": ["rate<0.01"],
    "http_req_duration{endpoint:profile}": ["p(95)<1000"],
  },
};

const BASE_URL = "http://localhost:3000";

export function setup() {
  const email = __ENV.TEST_EMAIL;
  const password = __ENV.TEST_PASSWORD;

  if (!email || !password) {
    throw new Error("TEST_EMAIL and TEST_PASSWORD are required");
  }

  const response = http.post(
    `${BASE_URL}/api/users/login`,
    JSON.stringify({ email, password }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { endpoint: "login" },
    },
  );

  const loginSuccessful = check(response, {
    "login successful": (r) => r.status === 200,
  });

  const token = response.cookies.token?.[0]?.value;

  if (!loginSuccessful || !token) {
    throw new Error(`Login failed with status ${response.status}`);
  }

  return { token };
}

export default function (data) {
  const response = http.get(`${BASE_URL}/api/users/profile`, {
    cookies: {
      token: data.token,
    },
    tags: {
      endpoint: "profile",
    },
  });

  check(response, {
    "profile returns 200": (r) => r.status === 200,
    "profile contains user": (r) => {
      try {
        return Boolean(r.json("user.email"));
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}
