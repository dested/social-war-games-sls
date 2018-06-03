import {Worker} from './worker';
import {Setup} from './setup';

if (process.argv[2] === 'setup') {
    Setup.start();
} else if (process.argv[2] === 'work') {
    Worker.start();
} else {
    console.log('setup or work');
}
