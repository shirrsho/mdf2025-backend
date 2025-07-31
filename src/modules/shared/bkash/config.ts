type Config = {
  Bkash: {
    GRANT_TOKEN_URL: string;
    REFRESH_TOKEN_URL: string;
    CREATE_PAYMENT_URL: string;
    EXECUTE_PAYMENT_URL: string;
    BACKEND_CALLBACK_URL: string;
    FRONTEND_SUCCESS_URL: string;
    FRONTEND_FAIL_URL: string;
    USERNAME: string;
    PASSWORD: string;
    APP_KEY: string;
    APP_SECRET: string;
  };
};

export const config = (): Config => ({
  Bkash: {
    GRANT_TOKEN_URL: process.env.GRANT_TOKEN_URL || '',
    REFRESH_TOKEN_URL: process.env.REFRESH_TOKEN_URL || '',
    CREATE_PAYMENT_URL: process.env.CREATE_PAYMENT_URL || '',
    EXECUTE_PAYMENT_URL: process.env.EXECUTE_PAYMENT_URL || '',
    BACKEND_CALLBACK_URL: process.env.BACKEND_CALLBACK_URL || '',
    FRONTEND_SUCCESS_URL: process.env.FRONTEND_SUCCESS_URL || '',
    FRONTEND_FAIL_URL: process.env.FRONTEND_FAIL_URL || '',
    USERNAME: process.env.USERNAME || '',
    PASSWORD: process.env.PASSWORD || '',
    APP_KEY: process.env.APP_KEY || '',
    APP_SECRET: process.env.APP_SECRET || '',
  },
});
