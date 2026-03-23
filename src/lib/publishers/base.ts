export type PublishResult = {
  success: boolean;
  platformPostId?: string;
  error?: string;
};

export type PublishInput = {
  content: string;
  mediaUrls: string[];
  accessToken: string;
  platformAccountId?: string;
};
