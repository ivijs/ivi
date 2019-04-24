import { EventHandler } from "../events/event_handler";
import { NodeFlags } from "./node_flags";
import { ElementProtoDescriptor } from "./element_proto";
import { ComponentDescriptor, StatelessComponentDescriptor } from "./component";
import { ContextDescriptor, ContextState } from "./context";

/**
 * Operation type.
 */
export interface OpType {
  /**
   * See {@link NodeFlags} for details.
   */
  readonly f: NodeFlags;
  /**
   * Operation type descriptor.
   */
  readonly d:
  | StatelessComponentDescriptor
  | ComponentDescriptor
  | ElementProtoDescriptor
  | ContextDescriptor
  | string
  | null;
}

/**
 * createOpType creates {@link OpType} instances.
 *
 * @param f See {@link NodeFlags} for details.
 * @param d Operation type descriptor.
 * @returns {@link OpType} instance.
 */
export const createOpType = (
  f: NodeFlags,
  d: StatelessComponentDescriptor | ComponentDescriptor | ElementProtoDescriptor | ContextDescriptor | string | null,
): OpType => ({ f, d });

/**
 * OpType for Events nodes.
 */
export const EVENTS = createOpType(NodeFlags.Events, null);

/**
 * OpType for Context state nodes.
 */
export const SET_CONTEXT_STATE = createOpType(NodeFlags.Context | NodeFlags.SetContextState, null);

/**
 * OpType for TrackByKey nodes.
 */
export const TRACK_BY_KEY = createOpType(NodeFlags.TrackByKey, null);

/**
 * Operation node.
 *
 * @typeparam T Operation data type.
 */
export interface OpNode<T = any> {
  /**
   * Operation type.
   */
  readonly t: OpType;
  /**
   * Operation data.
   */
  readonly d: T;
}

/**
 * createOpNode creates an {@link OpNode} instance.
 *
 * @typeparam T Operation data type.
 * @param t Operation type.
 * @param d Operation data.
 * @returns {@link OpNode} instance.
 */
export const createOpNode = <T>(t: OpType, d: T): OpNode<T> => ({ t, d });

/**
 * Operation data for element operations.
 *
 * @typeparam T Element attributes type.
 */
export interface ElementData<T = any> {
  /**
   * Element class name.
   */
  readonly n: string | undefined;
  /**
   * Element attributes.
   */
  readonly a: T | undefined;
  /**
   * Children operations.
   */
  readonly c: Op;
}

/**
 * Element operation.
 */
export type ElementOp<T = any> = OpNode<ElementData>;

/**
 * Operation.
 */
export type Op = string | number | OpNode | OpArray | null;

/**
 * Recursive operation array.
 */
export interface OpArray extends Array<Op> { }

/**
 * Generic operation data for operations that has children nodes.
 *
 * @typeparam T Additional data type.
 */
export interface OpData<T = any> {
  /**
   * Generic value.
   */
  readonly v: T;
  /**
   * Children operation nodes.
   */
  readonly c: Op;
}

/**
 * Operation data for Events operations.
 */
export type EventsData = OpData<EventHandler>;

/**
 * Events operation.
 */
export type EventsOp = OpNode<EventsData>;

/**
 * Operation data for Context operations.
 */
export type ContextData<T = any> = OpData<T>;

/**
 * Context operation.
 */
export type ContextOp<T = any> = OpNode<ContextData<T>>;

/**
 * Set context state operation.
 */
export type SetContextStateOp = OpNode<OpData<ContextState>>;

/**
 * Operation factory for event handlers.
 *
 * @example
 *
 *     render(
 *       Events(onClick(() => { console.log("clicked"); }),
 *         ChildComponent(),
 *       ),
 *       DOMContainer,
 *     );
 *
 * @param v Event handlers.
 * @param c Children operation nodes.
 * @returns Events handler operation.
 */
export const Events = (
  v: EventHandler,
  c: Op,
): OpNode<EventsData> => createOpNode(EVENTS, { v, c });

/**
 * Operation factory for set context state operation.
 *
 * @param v Context state.
 * @param c Children operation nodes.
 * @returns Set context state operation.
 */
export const SetContextState = (v: ContextState, c: Op) => createOpNode(SET_CONTEXT_STATE, { v, c });

/**
 * Key is an object that is used by TrackByKey operations to track operations.
 *
 * @typeparam K Key type.
 * @typeparam V Value type.
 */
export interface Key<K, V> {
  /**
   * Key.
   */
  readonly k: K;
  /**
   * Value.
   */
  readonly v: V;
}

/**
 * key creates a {@link Key} instance.
 *
 * @typeparam K Key type.
 * @typeparam V Value type.
 * @param k Key.
 * @param v Value.
 * @returns {@link Key} instance.
 */
export const key = <K, V>(k: K, v: V): Key<K, V> => ({ k, v });

/**
 * TrackByKey operation.
 */
export type TrackByKeyOp<K, V> = OpNode<Key<K, V>>;

/**
 * Operation factory for track by key nodes.
 *
 * @example
 *
 *     const items = [1, 2, 3];
 *     render(
 *       TrackByKey(items.map((item) => key(item, div(_, _, item))),
 *       DOMContainer,
 *     );
 *
 * @typeparam K Key type.
 * @param items Keyed operations.
 * @returns Track by key operation.
 */
export const TrackByKey = process.env.NODE_ENV !== "production" ?
  <T>(items: Key<T, Op>[]) => {
    const keys = new Set<T>();
    for (let i = 0; i < items.length; i++) {
      const { k } = items[i];
      if (keys.has(k)) {
        throw new Error(`Invalid key, found duplicated key: ${k}`);
      }
      keys.add(k);
    }
    return createOpNode(TRACK_BY_KEY, items);
  } :
  /* istanbul ignore next */ <T>(items: Key<T, Op>[]) => createOpNode(TRACK_BY_KEY, items);
