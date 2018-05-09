import { map, children, VNodeFlags } from "ivi";
import * as h from "ivi-html";

test(`empty`, () => {
  expect(map([], () => h.div())).toBeNull();
});

test(`check array value [5]`, () => {
  map([5], (v) => {
    expect(v).toBe(5);
    return h.div().k(v);
  });
});

test(`check array values [5, 6]`, () => {
  let i = 5;
  map([5, 6], (v) => {
    expect(v).toBe(i++);
    return h.div().k(v);
  });
});

test(`check array index [5]`, () => {
  map([5], (v, i) => {
    expect(i).toBe(0);
    return h.div().k(v);
  });
});

test(`check array indexes [5, 6]`, () => {
  let j = 0;
  map([5, 6], (v, i) => {
    expect(i).toBe(j++);
    return h.div().k(v);
  });
});

test(`one node`, () => {
  const v1 = h.div().k(5);
  const first = map([5], () => v1);

  expect(first).toBe(v1);
  expect(v1._flags & VNodeFlags.KeyedList).toBeTruthy();
  expect(v1._prev).toBe(v1);
  expect(v1._next).toBeNull();
});

test(`two nodes`, () => {
  const v1 = h.div().k(5);
  const v2 = h.div().k(6);
  const first = map([5, 6], (v) => v === 5 ? v1 : v2);

  expect(first).toBe(v1);
  expect(v1._flags & VNodeFlags.KeyedList).toBeTruthy();
  expect(v1._prev).toBe(v2);
  expect(v1._next).toBe(v2);
  expect(v2._prev).toBe(v1);
  expect(v2._next).toBeNull();
});

test(`filter all nodes [5]`, () => {
  const first = map([5], () => null);
  expect(first).toBeNull();
});

test(`filter all nodes [5, 6]`, () => {
  const first = map([5, 6], () => null);
  expect(first).toBeNull();
});

test(`filter first node [5, 6]`, () => {
  const v1 = h.div().k(5);
  const first = map([5, 6], (v) => v === 5 ? null : v1);

  expect(first).toBe(v1);
  expect(v1._prev).toBe(v1);
  expect(v1._next).toBeNull();
});

test(`filter second node [5, 6]`, () => {
  const v1 = h.div().k(5);
  const first = map([5, 6], (v) => v === 6 ? null : v1);

  expect(first).toBe(v1);
  expect(v1._prev).toBe(v1);
  expect(v1._next).toBeNull();
});

test(`raise an exception when VNode doesn't have an explicit key (first node)`, () => {
  expect(() => { map([0], (v) => h.div()); }).toThrowError("key");
});

test(`raise an exception when VNode doesn't have an explicit key (second node)`, () => {
  expect(() => { map([0, 1], (v) => v === 0 ? h.div().k(0) : h.div()); }).toThrowError("key");
});

test(`raise an exception when function returns children collection`, () => {
  expect(() => { map([0], () => children(h.div().k(0), h.div().k(1))); }).toThrowError("singular");
});
