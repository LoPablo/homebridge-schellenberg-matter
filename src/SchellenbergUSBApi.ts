import type { Logger } from 'homebridge'
import {ReadlineParser, SerialPort} from "serialport";
import {clearTimeout} from "node:timers";



type  command = {
    command: string;
    resolve: (value : unknown) => void;
    reject: (error: Error) => void;
    retryCount : number;
    timeout: NodeJS.Timeout | null;
}

export const SchellenbergUSBCommands = {
    UP: '01',
    DOWN: '02',
    STOP: '00'
} as const

export class SchellenbergUSBApi {

    private commandQueue: command[]
    private activeCommand : command | null;
    private serialPort : SerialPort;
    private parser : ReadlineParser;
    private log : Logger;

    private readonly maxRetries = 3
    private readonly timeoutMs = 3000

    constructor(devicePath: string, log: Logger) {
        this.commandQueue = []
        this.log = log
        this.activeCommand = null
        this.serialPort = new SerialPort({
            path: devicePath,
            baudRate: 115200
        })
        this.serialPort.write('helo')
        this.parser = this.serialPort.pipe(new ReadlineParser({ delimiter: '\n' }))
        this.parser.on('data', (data) => {

            this.handleData(data)
        })
    }

    public async sendCommand(deviceId: string, command: string){
        let completeCommand = 'ss' + deviceId + '9' + command + '0000'
        return new Promise((resolve, reject) => {
            this.commandQueue.push({
                command: completeCommand,
                resolve,
                reject,
                retryCount: 0,
                timeout: null,
            })
            this.workOnQueue()
        })

    }

    private workOnQueue(){
        if (this.activeCommand !== null) {
            return
        }

        const nextCommand = this.commandQueue.shift()
        if (!nextCommand) {
            return
        }

        this.activeCommand = nextCommand
        this.writeActiveCommand()
    }

    private writeActiveCommand(): void {

        if (!this.activeCommand) {
            return
        }

        const command = this.activeCommand.command
        this.log.info(`Sending command: ${command}`)

        this.activeCommand.timeout = setTimeout(() => {
            this.log.info(`Command timeout: ${command}`)
            this.retryOrFailActiveCommand(new Error(`Timeout while waiting for t0 after command ${command}`))

        }, this.timeoutMs)

        this.serialPort.write(command + '\n', (error) => {
            if (error) {
                this.log.warn(`Failed to write command: ${error}`)
                this.retryOrFailActiveCommand(error)
                return
            }
        })

    }

    private retryOrFailActiveCommand(error: Error): void {

        if (!this.activeCommand) {
            return
        }

        this.clearActiveTimeout()

        if (this.activeCommand.retryCount < this.maxRetries) {
            this.activeCommand.retryCount++
            this.log.warn(
                `Retrying command ${this.activeCommand.command}, attempt ${this.activeCommand.retryCount}/${this.maxRetries}`
            )
            this.writeActiveCommand()
            return
        }

        this.failActiveCommand(error)
    }

    private failActiveCommand(error: Error): void {

        if (!this.activeCommand) {
            return
        }

        this.clearActiveTimeout()
        const failedCommand = this.activeCommand
        this.activeCommand = null
        failedCommand.reject(error)
        this.workOnQueue()
    }

    private clearActiveTimeout(): void {

        if (this.activeCommand?.timeout) {
            clearTimeout(this.activeCommand.timeout)
            this.activeCommand.timeout = null
        }

    }

    private handleData(data: string): void {
        if (!this.activeCommand) {
            this.log.warn('No active command, unsolicited data:')
            this.log.warn(data)
            return
        }

        switch (data) {
            case 'tE':
                this.log.warn('Stick returned error tE')
                this.clearActiveTimeout()
                this.retryOrFailActiveCommand(new Error('Stick returned tE'))
                break

            case 't1':
                this.log.warn('Command activated: t1')
                break

            case 't0':
                this.log.warn('Command finished: t0')
                this.clearActiveTimeout()
                this.activeCommand.resolve('')
                this.activeCommand = null
                this.workOnQueue()
                break

            default:
                this.log.warn(`Unknown response from stick: ${data}`)
                break
        }
    }

}