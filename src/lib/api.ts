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
        `${this.config.baseUrl}/api/itd/vds/v-dSEvent-data/list`,
        data,
        { headers: this.getHeaders() }
      );

      return { success: true, count: data.length };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          return { success: false, count: 0, error: 'Unauthorized - Please login again' };
        }
        return { success: false, count: 0, error: error.message };
      }
      const message = error instanceof Error ? error.message : 'Failed to connect to API';
      return { success: false, count: 0, error: message };
    }
  }

  async seedVdsEventDataSequential(
    data: VDSEventData[],
    onProgress?: (current: number, total: number) => void
  ): Promise<{ success: boolean; count: number; error?: string }> {
    if (!this.config.baseUrl) {
      return { success: false, count: 0, error: 'API URL not configured' };
    }

    let successCount = 0;
    let lastError = '';

    for (let i = 0; i < data.length; i++) {
      try {
        await axios.post(
          `${this.config.baseUrl}/api/itd/vds/v-dSEvent-data/sequence`,
          data[i],
          { headers: this.getHeaders() }
        );
        successCount++;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            return { success: false, count: successCount, error: 'Unauthorized - Please login again' };
          }
          lastError = error.message;
        } else {
          lastError = error instanceof Error ? error.message : 'Failed to seed record';
        }
      }
      onProgress?.(i + 1, data.length);
    }

    if (successCount === 0) {
      return { success: false, count: 0, error: lastError || 'All records failed' };
    }

    return { success: true, count: successCount, error: successCount < data.length ? `Partial: ${successCount}/${data.length}` : undefined };
  }

  async seedVdsEventDataConcurrent(
    data: VDSEventData[],
    concurrency: number,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ success: boolean; count: number; error?: string }> {
    if (!this.config.baseUrl) {
      return { success: false, count: 0, error: 'API URL not configured' };
    }

    let successCount = 0;
    let completedCount = 0;
    const total = data.length;
    const errors: string[] = [];

    const seedOne = async (item: VDSEventData): Promise<void> => {
      try {
        await axios.post(
          `${this.config.baseUrl}/api/itd/vds/v-dSEvent-data/sequence`,
          item,
          { headers: this.getHeaders() }
        );
        successCount++;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          errors.push(error.message);
        } else {
          errors.push(error instanceof Error ? error.message : 'Failed to seed record');
        }
      } finally {
        completedCount++;
        onProgress?.(completedCount, total);
      }
    };

    // Process in batches of concurrency
    for (let i = 0; i < data.length; i += concurrency) {
      const batch = data.slice(i, i + concurrency);
      await Promise.all(batch.map(seedOne));
    }

    if (successCount === 0) {
      return { success: false, count: 0, error: errors[0] || 'All records failed' };
    }

    return { 
      success: true, 
      count: successCount, 
      error: successCount < total ? `Partial: ${successCount}/${total}` : undefined 
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config.baseUrl) {
      return { success: false, message: 'API URL not configured' };
    }

    try {
      await axios.get(`${this.config.baseUrl}/api/itd/vds/v-dSEvent-data/list`, {
        headers: this.getHeaders(),
        timeout: 5000,
      });
      return { success: true, message: 'Connection successful' };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          return { success: true, message: 'Connection successful (requires auth)' };
        }
        if (error.response?.status === 405) {
          return { success: true, message: 'Connection successful' };
        }
      }
      const message = error instanceof Error ? error.message : 'Connection failed';
      return { success: false, message };
    }
  }
}

export const apiService = new ApiService();
