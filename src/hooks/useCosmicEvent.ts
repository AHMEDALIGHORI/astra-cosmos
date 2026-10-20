'use client';

import { useEffect, useRef } from 'react';
import { cosmicEvents, type CosmicEventMap, type CosmicEventName } from '@/lib/events';

export function useCosmicEvent<K extends CosmicEventName>(name: K, handler: (payload: CosmicEventMap[K]) => void) {
  const callback = useRef(handler);
  useEffect(() => { callback.current = handler; }, [handler]);
  useEffect(() => {
    const unsubscribe = cosmicEvents.on(name, (payload) => callback.current(payload));
    return () => { unsubscribe(); };
  }, [name]);
}
