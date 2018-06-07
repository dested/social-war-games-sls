export type ResourceType = 'bronze' | 'silver' | 'gold';

export interface ResourceDetail {
    type: ResourceType;
    startingCount: number;
}

export let ResourceDetails: {[key in ResourceType]: ResourceDetail} = {
    bronze: {
        type: 'bronze',
        startingCount: 100
    },
    silver: {
        type: 'silver',
        startingCount: 100
    },
    gold: {
        type: 'gold',
        startingCount: 100
    }
};

export interface GameResource {
    x: number;
    y: number;
    resourceType: ResourceType;
    currentCount: number;
}
