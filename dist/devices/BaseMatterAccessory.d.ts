/**
 * Base Matter Accessory Class
 *
 * This base class implements the MatterAccessory interface and provides
 * common functionality that all Matter devices can use.
 *
 * Individual device types should extend this class and call super() with
 * the required configuration.
 */
import type { API, ClusterStateMap, EndpointType, Logger, MatterAccessory, MatterAPI } from 'homebridge';
export interface BaseMatterAccessoryConfig {
    UUID: string;
    displayName: string;
    deviceType: EndpointType;
    serialNumber: string;
    manufacturer: string;
    model: string;
    firmwareRevision: string;
    hardwareRevision: string;
    context?: Record<string, unknown>;
    clusters?: MatterAccessory['clusters'];
    handlers?: MatterAccessory['handlers'];
    parts?: MatterAccessory['parts'];
}
/**
 * Base class for all Matter accessories
 * Implements the MatterAccessory interface and provides common methods
 */
export declare abstract class BaseMatterAccessory implements MatterAccessory {
    readonly UUID: string;
    readonly displayName: string;
    readonly deviceType: EndpointType;
    readonly serialNumber: string;
    readonly manufacturer: string;
    readonly model: string;
    readonly firmwareRevision: string;
    readonly hardwareRevision: string;
    readonly context: Record<string, unknown>;
    readonly clusters?: MatterAccessory['clusters'];
    readonly handlers?: MatterAccessory['handlers'];
    readonly parts?: MatterAccessory['parts'];
    protected readonly api: API;
    protected readonly log: Logger;
    protected readonly matter: MatterAPI;
    protected constructor(api: API, log: Logger, config: BaseMatterAccessoryConfig);
    /**
     * Update the accessory state
     * Helper method to update cluster attributes with full type safety
     *
     * @example
     * ```typescript
     * // Known clusters get autocomplete for attribute names
     * await this.updateState('onOff', { onOff: true })
     * await this.updateState('levelControl', { currentLevel: 200 })
     *
     * // Unknown/custom clusters still work with Record<string, unknown>
     * await this.updateState('customCluster', { myAttr: 42 })
     * ```
     */
    protected updateState<K extends keyof ClusterStateMap>(cluster: K, attributes: Partial<ClusterStateMap[K]>, partId?: string): Promise<void>;
    protected updateState(cluster: string, attributes: Record<string, unknown>, partId?: string): Promise<void>;
    /**
     * Read the current accessory state
     * Helper method to retrieve cluster attributes with full type safety
     *
     * @example
     * ```typescript
     * // Known clusters return typed state
     * const state = await this.readState('onOff')
     * if (state?.onOff) {
     *   this.logInfo('light is on')
     * }
     *
     * // Works with partId for composed devices
     * const outletState = await this.readState('onOff', 'outlet-1')
     * ```
     */
    protected readState<K extends keyof ClusterStateMap>(cluster: K, partId?: string): Promise<Partial<ClusterStateMap[K]> | undefined>;
    protected readState(cluster: string, partId?: string): Promise<Record<string, unknown> | undefined>;
    /**
     * Log helper methods
     */
    protected logInfo(message: string, ...args: unknown[]): void;
    protected logError(message: string, ...args: unknown[]): void;
    protected logDebug(message: string, ...args: unknown[]): void;
    protected logWarn(message: string, ...args: unknown[]): void;
    /**
     * Convert this class instance to a plain MatterAccessory object
     * This is what gets registered with Homebridge
     */
    toAccessory(): MatterAccessory;
}
