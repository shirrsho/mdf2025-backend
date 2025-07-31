type Config = {
  SSLCommerz: {
    STORE_ID: string;
    STORE_PASSWORD: string;
    IS_LIVE: boolean;
    INIT_URL: string;
    BACKEND_SUCCESS_URL: string;
    BACKEND_FAIL_URL: string;
    BACKEND_CANCEL_URL: string;
  };
};

export const config = (): Config => ({
  SSLCommerz: {
    STORE_ID: process.env.STORE_ID || '',
    STORE_PASSWORD: process.env.STORE_PASSWORD || '',
    IS_LIVE: process.env.IS_LIVE === 'true' || false,
    INIT_URL: process.env.INIT_URL || '',
    BACKEND_SUCCESS_URL: process.env.BACKEND_SUCCESS_URL || '',
    BACKEND_FAIL_URL: process.env.BACKEND_FAIL_URL || '',
    BACKEND_CANCEL_URL: process.env.BACKEND_CANCEL_URL || '',
  },
});
