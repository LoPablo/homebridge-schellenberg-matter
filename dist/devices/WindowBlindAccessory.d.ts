import type { API, Logger } from 'homebridge';
import { BaseMatterAccessory } from "./BaseMatterAccessory.js";
import { SchellenbergUSBApi } from "../SchellenbergUSBApi.js";
export declare class WindowBlindAccessory extends BaseMatterAccessory {
    private sApi;
    private config;
    private currentPosition;
    private targetPosition;
    private shutterStepTime;
    private shutterDriver;
    constructor(api: API, log: Logger, config: any, schellenbergAPI: SchellenbergUSBApi);
    private handleGoToLift;
    private handleUpOrOpen;
    private handleDownOrClose;
    private handleStop;
    updateLiftPosition(percent: number): Promise<void>;
    private shutterInterval;
}
