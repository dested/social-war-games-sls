export class HexColors {
    public static factionIdToColor(factionId: string, neighborFactionId: string = '0', transparency: string = '1') {
        switch (factionId) {
            case '0':
                return null;
            case '1':
                switch (neighborFactionId) {
                    case '0':
                        return `rgba(251, 56, 66,${transparency})`;
                    case '1':
                        return `rgba(251, 56, 66,${transparency})`;
                    case '2':
                        return `rgba(217,149,60,${transparency})`;
                    case '3':
                        return `rgba(217,149,60,${transparency})`;
                }
                break;
            case '2':
                switch (neighborFactionId) {
                    case '0':
                        return `rgba(183, 241, 54,${transparency})`;
                    case '1':
                        return `rgba(217,149,60,${transparency})`;
                    case '2':
                        return `rgba(183, 241, 54,${transparency})`;
                    case '3':
                        return `rgba(157,145,119,${transparency})`;
                }
                break;
            case '3':
                switch (neighborFactionId) {
                    case '0':
                        return `rgba(131, 49, 183,${transparency})`;
                    case '1':
                        return `rgba(217, 149, 60,${transparency})`;
                    case '2':
                        return `rgba(157,145,119,${transparency})`;
                    case '3':
                        return `rgba(131, 49, 183,${transparency})`;
                }
                break;
        }
    }
    public static defaultBorder = 'rgba(127,127,127,0.13)';
}
