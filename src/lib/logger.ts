export const logger = {
  info: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.info(...args);
    }
  },
  error: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.error(...args);
    }
  },
};
