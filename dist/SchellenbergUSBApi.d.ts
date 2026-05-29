import type { Logger } from 'homebridge';
export declare const SchellenbergUSBCommands: {
    readonly UP: "01";
    readonly DOWN: "02";
    readonly STOP: "00";
};
export declare class SchellenbergUSBApi {
    private commandQueue;
    private activeCommand;
    private serialPort;
    private parser;
    private log;
    private readonly maxRetries;
    private readonly timeoutMs;
    constructor(devicePath: string, log: Logger);
    sendCommand(deviceId: string, command: string): Promise<unknown>;
    private workOnQueue;
    private writeActiveCommand;
    private retryOrFailActiveCommand;
    private failActiveCommand;
    private clearActiveTimeout;
    private handleData;
}
