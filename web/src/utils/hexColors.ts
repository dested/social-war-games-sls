export class HexColors {
    public static factionIdToColor(factionId: string, neighborFactionId: string, transparency: string) {
        switch (factionId) {
            case '0':
                return null;
            case '1':
                switch (neighborFactionId) {
                    case '0':
                        return `rgba(255,0,0,${transparency})`;
                    case '1':
                        return `rgba(255,0,0,${transparency})`;
                    case '2':
                        return `rgba(127,127,0,${transparency})`;
                    case '3':
                        return `rgba(127,0,127,${transparency})`;
                }
                break;
            case '2':
                switch (neighborFactionId) {
                    case '0':
                        return `rgba(0,255,0,${transparency})`;
                    case '1':
                        return `rgba(127,127,0,${transparency})`;
                    case '2':
                        return `rgba(0,255,0,${transparency})`;
                    case '3':
                        return `rgba(0,127,127,${transparency})`;
                }
                break;
            case '3':
                switch (neighborFactionId) {
                    case '0':
                        return `rgba(0,0,255,${transparency})`;
                    case '1':
                        return `rgba(127,0,127,${transparency})`;
                    case '2':
                        return `rgba(0,127,127,${transparency})`;
                    case '3':
                        return `rgba(0,0,255,${transparency})`;
                }
                break;
        }
    }
    public static defaultBorder = 'rgba(127,127,127,0.13)';
}
