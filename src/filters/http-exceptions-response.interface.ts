export interface HttpExceptionResponse {
  statusCode: number;
  message: string;
  error?: string;
}

export interface CustomHttpExceptionResponse extends HttpExceptionResponse {
  path: string;
  method: string;
  timeStamp: string;
}
