import type { MessagePort } from 'worker_threads';

export interface StartupMessage {
  filename : string | null;
  port : MessagePort;
  sharedBuffer : Int32Array;
  useAtomics : boolean;
}

export interface RequestMessage {
  taskId : number;
  task : any;
  filename: string;
}

export interface ReadyMessage {
  ready: true
};

export interface ResponseMessage {
  taskId : number;
  result : any;
  error: Error | null;
}

export const commonState = {
  isWorkerThread: false,
  workerData: undefined
};

// True if the object implements the Transferable interface
export function isTransferable (value : any) : boolean {
  return value != null && typeof value === 'object' && 'transferable' in value;
}

// Internal symbol used to mark Transferable objects returned
// by the Piscina.move() function
const kMovable = Symbol('Piscina.kMovable');

// True if object implements Transferable and has been returned
// by the Piscina.move() function
export function isMovable (value : any) : boolean {
  return isTransferable(value) && value[kMovable] === true;
}

export function markMovable (value: any) : void {
  Object.defineProperty(value, kMovable, {
    enumerable: false,
    value: true
  });
}

export interface Transferable {
  readonly transferable : any;
  valueOf() : any;
}

export const kRequestCountField = 0;
export const kResponseCountField = 1;
export const kFieldCount = 2;
