<script >
    let orgAlias ='';
    let monitoringalias ='';
    let keepdata = false;
    let healthcheck = true;
    let limits = true; 
    let codeanalysis = true; 
    let tests = true;
    let outputdirectory = true;
    let metadata = true;
    let monitoringorg = false;

    function summarizeOrg() {
       let flags = {
          'keepdata':keepdata,
          'healthcheck': healthcheck,
          'limits': limits,
          'codeanalysis': codeanalysis,
          'tests': tests,
          'metadata': metadata
        };
        if (orgAlias) {
          flags['targetusername'] =  orgAlias;
        }
        tsvscode.postMessage({type:"summarize", value: flags});
    }

    function uploadSummaryToOrg() {
        if (monitoringalias && monitoringalias !== '') {
          flags['targetusername'] =  monitoringalias;
        } else {
          flags['targetusername'] =  orgAlias;
        }

        if(outputdirectory){
          flags['outputdirectory'] = true;
        }
        tsvscode.postMessage({type:"upload", value: flags});
    }

  </script>

<br />
  <h2>Summarize Salesforce Org</h2>
  <p>You can create a summary for any connected Salesforce Org by typing its org alias into the textarea below and then pressing the 'Summarize Org' button</p>
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
  <button on:click={summarizeOrg}>Summarize Org</button>
  <br />
  <br />
  <h2>Upload Summary</h2>
  <p>If you want to use the summaries in Salesforce for logging/reporting puproses, you can upload a summary to an Org using our prepacked data model and upload feature below. Make sure you install the data model before uploading the summary.</p>
  <br/>

  <label for="monitoringorg">Upload Result to a different Org</label>
  <input type="checkbox" name="monitoringorg" id="monitoringorg" bind:checked={monitoringorg}>
  {#if monitoringorg}
    <label for="monitoringalias">Monitoring Org Alias</label>
    <input bind:value={monitoringalias} name="monitoringalias"/>
  {/if}
  <button on:click={uploadSummaryToOrg}>Upload Summary to Org</button>
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
  