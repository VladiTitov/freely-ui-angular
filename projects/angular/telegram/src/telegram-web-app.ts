/** `Telegram.WebApp` of the Mini App the page runs in; `undefined` when Telegram's script is not loaded. */
export function telegramWebApp(): any {
  return (globalThis as any).Telegram?.WebApp;
}

/** Whether Telegram opened the page; its script alone, loaded in a plain browser, gives no launch data. */
export function isInsideTelegram(): boolean {
  return !!telegramWebApp()?.initData;
}
