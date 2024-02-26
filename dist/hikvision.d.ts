/// <reference types="node" />
import { EventEmitter } from 'node:events';
import { HikVisionOptions } from './hikvision.options';
export declare class HikVision extends EventEmitter {
    private parser;
    private triggerActive;
    private activeEvents;
    connect(_options: HikVisionOptions): void;
    private handleConnection;
    private handleEnd;
    private handleError;
    private handleData;
    private parseOptions;
}
