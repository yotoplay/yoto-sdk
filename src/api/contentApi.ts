import type { AxiosInstance } from 'axios';
import type { UserCard, UserCardsResponse, YotoJson } from '../types.js';

export class ContentApi {
  constructor(private apiClient: AxiosInstance) {}

  async getMyCards(): Promise<UserCard[]> {
    const response = await this.apiClient.get<UserCardsResponse>('/content/mine');
    return response.data.cards;
  }

  async getCard(cardId: string): Promise<YotoJson> {
    const response = await this.apiClient.get<{ card: YotoJson }>(`/content/${cardId}`);
    return response.data.card;
  }

  async updateCard(card: YotoJson, skipMediaFileCheck = true): Promise<YotoJson> {
    const response = await this.apiClient.post('/content', card, {
      params: { skipMediaFileCheck }
    });
    return response.data.card;
  }
}
