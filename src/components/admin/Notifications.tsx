import { useEffect, useRef } from 'react';
import { createApp } from 'vue';
import Analytics from './Analytics.vue';

export function Notifications() {
    const vueContainerRef = useRef<HTMLDivElement>(null);
    const vueAppRef = useRef<any>(null);

    useEffect(() => {
        // Mount Vue component when React component mounts
        if (vueContainerRef.current && !vueAppRef.current) {
            vueAppRef.current = createApp(Analytics);
            vueAppRef.current.mount(vueContainerRef.current);
        }

        // Cleanup: unmount Vue component when React component unmounts
        return () => {
            if (vueAppRef.current) {
                vueAppRef.current.unmount();
                vueAppRef.current = null;
            }
        };
    }, []);

    return <div ref={vueContainerRef}></div>;
}
