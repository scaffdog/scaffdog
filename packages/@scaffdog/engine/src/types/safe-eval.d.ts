declare module 'safe-eval' {
  export default function eval(
    code: string,
    context?: { [key: string]: any },
    opts?: any,
  ): any;
}
