export interface HttpResponse<T> {
  statusCode: number;
  headers: any;
  body: T | { error: string };
}

export function respond<T>(statusCode: 200, body: T): HttpResponse<T>;
export function respond<T>(
  statusCode: number,
  body: { error: string }
): HttpResponse<any>;
export function respond<T>(
  statusCode: number,
  body: T | { error: string }
): HttpResponse<T | { error: string }> {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body
  };
}
