export class ApiResponseDto<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;

  constructor(data?: T, message?: string, success: boolean = true) {
    this.success = success;
    this.data = data;
    this.message = message;
  }

  static success<T>(data?: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto(data, message, true);
  }

  static error(message: string, errors?: any): ApiResponseDto {
    const response = new ApiResponseDto(null, message, false);
    if (errors) {
      response.errors = errors;
    }
    return response;
  }
} 