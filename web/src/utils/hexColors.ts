export class HexColors {
    public static factionIdToColor(
        factionId: string,
        neighborFactionId: string
    ) {
        switch (factionId) {
            case '0':
                return null;
            case '1':
                switch (neighborFactionId) {
                    case '0':
                        return 'rgba(255,0,0,1)';
                    case '1':
                        return 'rgba(2550,0,0,1)';
                    case '2':
                        return 'rgba(127,127,0,1)';
                    case '3':
                        return 'rgba(127,0,127,1)';
                }
                break;
            case '2':
                switch (neighborFactionId) {
                    case '0':
                        return 'rgba(0,255,0,1)';
                    case '1':
                        return 'rgba(127,127,0,1)';
                    case '2':
                        return 'rgba(0,255,0,1)';
                    case '3':
                        return 'rgba(0,127,127,1)';
                }
                break;
            case '3':
                switch (neighborFactionId) {
                    case '0':
                        return 'rgba(0,0,255,1)';
                    case '1':
                        return 'rgba(127,0,127,1)';
                    case '2':
                        return 'rgba(0,127,127,1)';
                    case '3':
                        return 'rgba(0,0,255,1)';
                }
                break;
        }
    }
    public static defaultBorder = 'rgba(127,127,127,0.13)';
}
