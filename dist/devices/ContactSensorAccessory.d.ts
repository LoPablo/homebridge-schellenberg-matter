/**
 * Contact Sensor Accessory Class
 */
import type { API, Logger } from 'homebridge';
import { BaseMatterAccessory } from "./BaseMatterAccessory.js";
export declare class ContactSensorAccessory extends BaseMatterAccessory {
    constructor(api: API, log: Logger);
    updateContactState(isOpen: boolean): Promise<void>;
}
