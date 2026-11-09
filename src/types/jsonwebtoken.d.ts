declare module "jsonwebtoken" {
  export interface SignOptions {
    expiresIn?: string | number;
    [key: string]: unknown;
  }
  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string,
    options?: SignOptions
  ): string;
  export function verify(
    token: string,
    secretOrPublicKey: string
  ): string | object;
  const jwt: {
    sign: typeof sign;
    verify: typeof verify;
  };
  export default jwt;
}
