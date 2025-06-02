import {
  type Dispatch,
  type SetStateAction,
  useLayoutEffect,
  useState,
} from 'react';

// Create encapsulated context for the type of T.
export function create<
  T,
  // Hint is optional by default. If you want to force the use
  // of hint, it's necessary not to add `void` in the type.
  Hint = void,
>(
  initialState: T,
  {
    hookOnBeforeStateSet,
    hookOnRenderContextCreates,
    hookOnRenderContextCloses,
  }: {
    // -- Hooks; are created to control lifecycle of external
    // state directly. It's useful not to affect components'
    // lifecycle.
    // NOTE: Changes made by hooks will not trigger re-render!
    // Preprocess new state before the depolyment.
    hookOnBeforeStateSet?: (newState: T) => T;
    // Preprocess state before render context being created.
    // This hook is not called inside of `useLayoutEffect` not to
    // disturb render process due to intermediate state change.
    // However, misuse of this hook is expected to impact
    // the application performance directly.
    hookOnRenderContextCreates?: (state: T, hint: Hint) => T;
    // Postprocess state after render context being closed.
    // This hooks is called in the callback of `useLayoutEffect`.
    hookOnRenderContextCloses?: (state: T, hint: Hint) => T;
  } = {},
) {
  // Keeps the reference to the state even in case of the first
  // citizens.
  const container = { state: initialState };

  // Manage dispatchers to be triggered.
  const dispatchers: Dispatch<SetStateAction<T>>[] = [];

  type SetStateCallback = (current: T) => T;

  function isSetStateCallback(
    callback: T | SetStateCallback,
  ): callback is SetStateCallback {
    return typeof callback === 'function';
  }

  function setState(newState: T | SetStateCallback) {
    if (isSetStateCallback(newState)) {
      newState = newState(container.state);
    }

    if (typeof hookOnBeforeStateSet !== 'undefined') {
      newState = hookOnBeforeStateSet(newState);
    }

    // Override the state. This does not trigger re-render in any
    // render context.
    container.state = newState;

    for (const dispatcher of dispatchers) {
      // Trigger re-render manually. There is no exception as
      // everything here is done synchronously.
      dispatcher(newState);
    }
  }

  return function useContext(hint: Hint) {
    if (typeof hookOnRenderContextCreates !== 'undefined') {
      container.state = hookOnRenderContextCreates(
        container.state,
        hint,
      );
    }

    // Below function body is expected to be run in the render context.
    // While we handle the state outside of React lifecycle, we provide
    // a reference to our state on time.
    const [local, setLocal] = useState<T>(container.state);

    useLayoutEffect(function () {
      // When render starts, we register the local dispatcher to our
      // context.
      dispatchers.push(setLocal);

      return function () {
        // When render ends, we unregister the local dispatcher.
        const index = dispatchers.indexOf(setLocal);
        if (typeof index !== 'undefined') {
          dispatchers.splice(index, 1);
        }

        if (typeof hookOnRenderContextCloses !== 'undefined') {
          container.state = hookOnRenderContextCloses(
            container.state,
            hint,
          );
        }
      };
    });

    return [local, setState] as const;
  };
}