<script >
    let orgAlias ='';
    let keepdata = false;
    let healthcheck = true;
    let limits = true; 
    let codeanalysis = true; 
    let tests = true;
    let outputdirectory = true;
    let metadata = true;

    function summarizeOrg() {
       let flags = {
          'keepdata':keepdata,
          'healthcheck': healthcheck,
          'limits': limits,
          'codeanalysis': codeanalysis,
          'tests': tests,
          'metadata': metadata,
          'outputdirectory':outputdirectory
        };
        if (orgAlias) {
          flags['targetusername'] =  orgAlias;
        }
        tsvscode.postMessage({type:"summarize", value: flags});
    }

</script>
<br>
<h2>Summarize Salesforce Org</h2>
<br>
<p>You can create a summary for any connected Salesforce Org by typing its org alias into the textarea below and then pressing the 'Summarize Org' button.</p>
<br/>

<label for="outputdirectory">Set Output Directory</label>
<input type="checkbox" name="outputdirectory" id="outputdirectory" bind:checked={outputdirectory}>
<label for="metadata">Summarize Metadata</label>
<input type="checkbox" name="metadata" id="metadata" bind:checked={metadata}>
<label for="healthcheck">Run Health Check</label>
<input type="checkbox" name="healthcheck" id="healthcheck" bind:checked={healthcheck}>
<label for="limits">Run Limit Analysis</label>
<input type="checkbox" name="limits" id="limits" bind:checked={limits}>
<label for="codeanalysis">Run Code Analysis</label>
<input type="checkbox" name="codeanalysis" id="codeanalysis" bind:checked={codeanalysis}>
<label for="tests">Run Apex Tests</label>
<input type="checkbox" name="tests" id="tests" bind:checked={tests}>
<label for="keepdata">Keep All Data</label>
<input type="checkbox" name="keepdata" id="keepdata" bind:checked={keepdata}>

<label for="alias">Org Alias</label>
<input bind:value={orgAlias} name="alias"/>
<br>
<button on:click={summarizeOrg}>Summarize Org</button>


<style>
    * {
    box-sizing: border-box;
    }
    label, input {
    width: 100%;
    display: block;
    }
    input {
    border-style: solid;
    border-width: 1px;
    }
  </style>
  