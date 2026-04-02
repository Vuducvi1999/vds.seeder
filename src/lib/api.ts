import axios from 'axios';
import { VDSEventData } from '@/types/vds-event';

export interface ApiConfig {
  baseUrl: string;
  token?: string;
}

interface PicsumImageResponse {
  imageUrl: string;
  base64Image: string;
}

interface ZoneListResponse {
  items?: Array<{
    code?: string | null;
    isActive?: boolean;
  }>;
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
      return { success: false, count: 0, error: 'Chưa cấu hình API URL' };
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
          return { success: false, count: 0, error: 'Không có quyền truy cập — vui lòng đăng nhập lại' };
        }
        return { success: false, count: 0, error: error.message };
      }
      const message = error instanceof Error ? error.message : 'Không thể kết nối tới API';
      return { success: false, count: 0, error: message };
    }
  }

  async seedVdsEventDataSequential(
    data: VDSEventData[],
    onProgress?: (current: number, total: number) => void
  ): Promise<{ success: boolean; count: number; error?: string }> {
    if (!this.config.baseUrl) {
      return { success: false, count: 0, error: 'Chưa cấu hình API URL' };
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
            return { success: false, count: successCount, error: 'Không có quyền truy cập — vui lòng đăng nhập lại' };
          }
          lastError = error.message;
        } else {
          lastError = error instanceof Error ? error.message : 'Không thể Seed record này';
        }
      }
      onProgress?.(i + 1, data.length);
    }

    if (successCount === 0) {
      return { success: false, count: 0, error: lastError || 'Tất cả record đều thất bại' };
    }

    return { success: true, count: successCount, error: successCount < data.length ? `Một phần: ${successCount}/${data.length} record thành công` : undefined };
  }

  async seedVdsEventDataConcurrent(
    data: VDSEventData[],
    concurrency: number,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ success: boolean; count: number; error?: string }> {
    if (!this.config.baseUrl) {
      return { success: false, count: 0, error: 'Chưa cấu hình API URL' };
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
          errors.push(error instanceof Error ? error.message : 'Không thể Seed record này');
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
      return { success: false, count: 0, error: errors[0] || 'Tất cả record đều thất bại' };
    }

    return { 
      success: true, 
      count: successCount, 
      error: successCount < total ? `Một phần: ${successCount}/${total} record thành công` : undefined 
    };
  }

  async changeBufferingChannelSetting(batchSize: number, seconds: number): Promise<{ success: boolean; error?: string }> {
    if (!this.config.baseUrl) {
      return { success: false, error: 'Chưa cấu hình API URL' };
    }

    try {
      await axios.post(
        `${this.config.baseUrl}/api/itd/vds/buffering-channel/change-setting`,
        null,
        {
          headers: this.getHeaders(),
          params: { batchSize, seconds },
        }
      );
      return { success: true };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          return { success: false, error: '401' };
        }
        return { success: false, error: error.message };
      }
      const message = error instanceof Error ? error.message : 'Không thể cập nhật cấu hình buffer';
      return { success: false, error: message };
    }
  }

  async getRandomPicsumImage(): Promise<{ success: boolean; imageUrl?: string; base64Image?: string; error?: string }> {
    try {
      const response = await axios.get<PicsumImageResponse>('/api/picsum-image');

      return {
        success: true,
        imageUrl: response.data.imageUrl,
        base64Image: response.data.base64Image,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message =
          typeof error.response?.data?.error === 'string'
            ? error.response.data.error
            : error.message;

        return { success: false, error: message };
      }

      const message = error instanceof Error ? error.message : 'Không thể lấy ảnh random';
      return { success: false, error: message };
    }
  }

  async saveBase64Image(base64Image: string, contextType: string): Promise<{ success: boolean; error?: string }> {
    if (!this.config.baseUrl) {
      return { success: false, error: 'Chưa cấu hình API URL' };
    }

    try {
      await axios.post(
        `${this.config.baseUrl}/api/itd/resource-service/base64Image/save-image`,
        {
          base64Image,
          contextType,
        },
        {
          headers: this.getHeaders(),
        }
      );

      return { success: true };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          return { success: false, error: '401' };
        }

        return { success: false, error: error.message };
      }

      const message = error instanceof Error ? error.message : 'Không thể lưu ảnh vào server';
      return { success: false, error: message };
    }
  }

  async getZoneCodes(): Promise<{ success: boolean; zoneCodes?: string[]; error?: string }> {
    if (!this.config.baseUrl) {
      return { success: false, error: 'Chưa cấu hình API URL' };
    }

    try {
      const response = await axios.get<ZoneListResponse>(
        `${this.config.baseUrl}/api/itd/master/zone`,
        {
          headers: this.getHeaders(),
          params: {
            MaxResultCount: 1000,
            SkipCount: 0,
          },
        }
      );

      const items = Array.isArray(response.data.items) ? response.data.items : [];
      const activeCodes = items
        .filter((item) => item.isActive !== false && item.code)
        .map((item) => item.code as string);
      const zoneCodes = activeCodes.length > 0
        ? activeCodes
        : items.filter((item) => item.code).map((item) => item.code as string);

      return { success: true, zoneCodes };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          return { success: false, error: '401' };
        }

        return { success: false, error: error.message };
      }

      const message = error instanceof Error ? error.message : 'Không thể lấy danh sách zone';
      return { success: false, error: message };
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config.baseUrl) {
      return { success: false, message: 'Chưa cấu hình API URL' };
    }

    try {
      await axios.get(`${this.config.baseUrl}/api/itd/vds/v-dSEvent-data/list`, {
        headers: this.getHeaders(),
        timeout: 5000,
      });
      return { success: true, message: 'Kết nối thành công' };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          return { success: true, message: 'Kết nối thành công' };
        }
        if (error.response?.status === 405) {
          return { success: true, message: 'Kết nối thành công' };
        }
      }
      const message = error instanceof Error ? error.message : 'Kết nối thất bại';
      return { success: false, message };
    }
  }
}

export const apiService = new ApiService();
