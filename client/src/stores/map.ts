import { defineStore } from 'pinia'

export const useMapStore = defineStore('map', {
    state: () => ({
        viewer: null as any,
    }),

    actions: {
        setViewer(viewer: any) {
            this.viewer = viewer
        },
    }
}) 