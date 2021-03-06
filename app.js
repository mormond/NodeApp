var Web3 = require('web3');
var web3 = new Web3();
var sys = require('sys');
var exec = require('child_process').exec

// Initialise config
var environment = process.env.MONITOR_ENVIRONMENT || 'development';
var jsonRpcEndpoint = process.env.JSONRPC_ENDPOINT || 'http://0.0.0.0:8545';
var intervalInSeconds = process.env.MONITOR_INTERVAL_SECS || 600;   // Default to 10 minutes
var intervalInMilliseconds = intervalInSeconds * 1000;
var previousBlockNumber = process.env.PREVIOUS_BLOCKNUMBER || 0;
var restartCommand = process.env.RESTART_COMMAND || 'pm2 restart gethNode';

if(environment == 'development') {
    console.log("Development Environment");
    console.log("----------------------");
    console.log("Restart command: " + restartCommand);
    console.log("JSON-RPC endpoint: " + jsonRpcEndpoint);
    console.log("Interval (secs): " + intervalInSeconds);
    console.log("Initial block number: " + previousBlockNumber);
    console.log("----------------------");
}

// Initialise Web3 connection
web3.setProvider(new web3.providers.HttpProvider(jsonRpcEndpoint));

// Pipe output to stdout
function puts(error, stdout, stderr) { sys.puts(stdout) }

// Restart eth process
function restartEth() {
    exec(restartCommand, puts);
}

// Periodically check whether the block number is increasing
setInterval(function () {
    console.log("Checking status of local ethereum client...");
    try {
        var currentBlockNumber = web3.eth.blockNumber;
        console.log("Current block number " + currentBlockNumber);
        if (currentBlockNumber > previousBlockNumber) {
            console.log("Everything looks ok!");
            previousBlockNumber = currentBlockNumber;
        } else {
            console.log("Block number appear to have stalled, let me give it a kick!");
            restartEth();
        }
    } catch (error) {
        console.log("Exception querying JSON-RPC: " + error);
        restartEth();
    }
}, intervalInMilliseconds)
