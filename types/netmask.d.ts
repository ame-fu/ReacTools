declare module "netmask" {
  export class Netmask {
    constructor(cidr: string);
    base: string;
    mask: string;
    host: string;
    bitmask: number;
    netLong: number;
    broadcastLong: number;
    size: number;
    first: string;
    last: string;
    contains(ip: string): boolean;
    forEach(fn: (ip: string, index: number) => void): void;
    next(): Netmask | undefined;
  }
}
