///<reference path="../../common/src/types/aesjs.d.ts"/>

import {Setup} from './setup';
import {Worker} from './worker';

if (process.argv[2] === 'setup') {
    Setup.start();
} else if (process.argv[2] === 'work') {
    Worker.start();
} else {
    console.log('setup or work');
}
