// Formato único de respuestas: success() para OK, error() para el filter
export class ApiResponse {
  static success<T>(data: T, message = 'OK'): { success: true; message: string; data: T } {
    return { success: true, message, data };
  }

  static error(message: string, status = 400): { success: false; message: string; status: number } {
    return { success: false, message, status };
  }
}
