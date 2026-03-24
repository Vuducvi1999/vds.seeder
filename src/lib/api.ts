import axios from 'axios';
import { VDSEventData } from '@/types/vds-event';

export interface ApiConfig {
  baseUrl: string;
  token?: string;
}

class ApiService {
  private config: ApiConfig = {
    baseUrl: '',
    token: '',
  };

  setConfig(config: ApiConfig) {
    this.config = config;
  }

  setToken(token: string) {
    this.config.token = token;
  }

  getConfig(): ApiConfig {
    return this.config;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }
    return headers;
  }

  async seedVdsEventData(data: VDSEventData[]): Promise<{ success: boolean; count: number; error?: string }> {
    if (!this.config.baseUrl) {
      return { success: false, count: 0, error: 'API URL not configured' };
    }

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/api/services/app/VdsEventData/CreateMultiple`,
        data,
        { headers: this.getHeaders() }
      );

      if (response.data.success) {
        return { success: true, count: data.length };
      }

      return { success: false, count: 0, error: response.data.error?.message || 'Unknown error' };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          return { success: false, count: 0, error: 'Unauthorized - Please login again' };
        }
        if (error.response?.data?.error?.message) {
          return { success: false, count: 0, error: error.response.data.error.message };
        }
        return { success: false, count: 0, error: error.message };
      }
      const message = error instanceof Error ? error.message : 'Failed to connect to API';
      return { success: false, count: 0, error: message };
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config.baseUrl) {
      return { success: false, message: 'API URL not configured' };
    }

    try {
      await axios.get(`${this.config.baseUrl}/api/services/app/VdsEventData/GetAll`, {
        headers: this.getHeaders(),
        timeout: 5000,
      });
      return { success: true, message: 'Connection successful' };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          return { success: true, message: 'Connection successful (requires auth)' };
        }
      }
      const message = error instanceof Error ? error.message : 'Connection failed';
      return { success: false, message };
    }
  }
}

export const apiService = new ApiService();
