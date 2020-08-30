import { resolveStoreService, StoreService } from '../store-manager/store.service';
import axios from 'axios';
import axiosRetry from 'axios-retry';

export default class HttpService {
  protected readonly storeService: StoreService;
  baseUrl: string;
  protected instance: any;

  constructor(storePrefix: string = '') {
    this.storeService = resolveStoreService(storePrefix);
    this.instance = axios.create();
    axiosRetry(this.instance, {
      retries: +process.env.HTTP_RETRIES,
      retryDelay: (retryCount) => {
        return retryCount * +process.env.HTTP_RETRY_DELAY;
      }
    });
  }

  request = async (method: string, url: string, data: any = null, fullResponse: boolean = false): Promise<any> => {
    const response = await this.instance({
      url,
      method,
      data
    });
    return fullResponse ? response : response.data;
  };
}
