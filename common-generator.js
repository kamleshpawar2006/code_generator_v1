const readline = require('readline');
const { exec } = require('child_process');
const path = require('path');

// Full absolute paths for both generators
const ngrxGeneratorPath = path.join(__dirname, 'ngrx_code.js');
const rxjsGeneratorPath = path.join(__dirname, 'generate-rxjs.js');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Ask entity name first
rl.question('Enter Entity Name (example: Product, User): ', (entityName) => {
    if (!entityName) {
        console.error("❌ Entity name cannot be empty.");
        rl.close();
        return;
    }

    // Ask which type to generate
    console.log('\nWhat do you want to generate?');
    console.log('1. NgRx');
    console.log('2. RxJS');
    console.log('3. Both\n');

    rl.question('Enter option (1/2/3): ', (option) => {
        option = option.trim();

        switch(option) {
            case '1':
                runGenerator(ngrxGeneratorPath, entityName);
                break;
            case '2':
                runGenerator(rxjsGeneratorPath, entityName);
                break;
            case '3':
                runGenerator(ngrxGeneratorPath, entityName, () => {
                    runGenerator(rxjsGeneratorPath, entityName);
                });
                break;
            default:
                console.error("❌ Invalid option selected.");
                break;
        }
        rl.close();
    });
});

function runGenerator(scriptPath, entityName, callback) {
    const command = `node "${scriptPath}" "${entityName}"`;
    console.log(`\n🚀 Running: ${command}\n`);
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error(`❌ Error: ${err.message}`);
            return;
        }
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
        if (callback) callback();
    });
}
