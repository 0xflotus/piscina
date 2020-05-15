import Piscina from '..';
import {
  isMovable,
  markMovable,
  isTransferable
} from '../dist/src/common';
import { test } from 'tap';
import { types } from 'util';
import { MessageChannel, MessagePort } from 'worker_threads';
import { resolve } from 'path';

test('Marking an object as movable works as expected', async ({ ok }) => {
  const obj = {
    get transferable () { return ''; }
  };
  ok(isTransferable(obj));
  ok(!isMovable(obj)); // It's not movable initially
  markMovable(obj);
  ok(isMovable(obj)); // It is movable now
});

test('Using Piscina.move() returns a movable object', async ({ ok }) => {
  const obj = {
    get transferable () { return ''; }
  };
  ok(!isMovable(obj)); // It's not movable initially
  const movable = Piscina.move(obj);
  ok(isMovable(movable)); // It is movable now
});

test('Using ArrayBuffer works as expected', async ({ ok, is }) => {
  const ab = new ArrayBuffer(5);
  const movable = Piscina.move(ab);
  ok(isMovable(movable));
  ok(types.isAnyArrayBuffer(movable.valueOf()));
  ok(types.isAnyArrayBuffer(movable.transferable));
  is(movable.transferable, ab);
});

test('Using TypedArray works as expected', async ({ ok, is }) => {
  const ab = new Uint8Array(5);
  const movable = Piscina.move(ab);
  ok(isMovable(movable));
  ok((types as any).isArrayBufferView(movable.valueOf()));
  ok(types.isAnyArrayBuffer(movable.transferable));
  is(movable.transferable, ab.buffer);
});

test('Using MessagePort works as expected', async ({ ok, is }) => {
  const mc = new MessageChannel();
  const movable = Piscina.move(mc.port1);
  ok(isMovable(movable));
  ok(movable.valueOf() instanceof MessagePort);
  ok(movable.transferable instanceof MessagePort);
  is(movable.transferable, mc.port1);
});

test('Moving a non-transferable value fails', async ({ throws }) => {
  // Values that are not transferable will make move throw
  throws(() => Piscina.move({ a: 1 }), /value is not transferable/);
  throws(() => Piscina.move('test'), /value is not transferable/);
  throws(() => Piscina.move(new Date()), /value is not transferable/);
});

test('Moving works', async ({ is, ok }) => {
  const pool = new Piscina({
    filename: resolve(__dirname, 'fixtures/move.ts')
  });

  {
    const ab = new ArrayBuffer(10);
    const ret = await pool.runTask(Piscina.move(ab));
    is(ab.byteLength, 0); // It was moved
    ok(types.isAnyArrayBuffer(ret));
  }

  {
    // Test with empty transferList
    const ab = new ArrayBuffer(10);
    const ret = await pool.runTask(Piscina.move(ab), []);
    is(ab.byteLength, 0); // It was moved
    ok(types.isAnyArrayBuffer(ret));
  }
});
