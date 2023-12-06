<script >
    let orgAlias ='';
    let keepdata = false;
    let nohealthcheck = false;
    let nolimits = false; 
    let nocodeanalysis = false; 
    let notests = false;
    let outputdirectory = true;

    function summarizeOrg() {
       let flags = {
          keepdata,
          nohealthcheck,
          nolimits,
          nocodeanalysis,
          notests
        };
        if (orgAlias) {
          flags['targetusername'] =  orgAlias;
        }
        if(outputdirectory){
          flags['outputdirectory'] = true;
        }
        tsvscode.postMessage({type:"summarize", value: flags});
    }

  </script>

  <h2>Summarize Org</h2>
  <br/>
  <p>You can create a summary for any connected Salesforce Org by typing its org alias into the textarea below and then pressing the 'Summarize Org' button</p>
  <br/>

  <label for="outputdirectory">Set Output Directory</label>
  <input type="checkbox" name="outputdirectory" id="outputdirectory" bind:value={outputdirectory} checked={outputdirectory}>
  <label for="nohealthcheck">Skip Health Check</label>
  <input type="checkbox" name="nohealthcheck" id="nohealthcheck" bind:value={nohealthcheck} checked={nohealthcheck}>
  <label for="nolimits">Skip Limit Analysis</label>
  <input type="checkbox" name="nolimits" id="nolimits" bind:value={nolimits} checked={nolimits}>
  <label for="nocodeanalysis">Skip Code Analysis</label>
  <input type="checkbox" name="nocodeanalysis" id="nocodeanalysis" bind:value={nocodeanalysis} checked={nocodeanalysis}>
  <label for="notests">Skip Test Runs</label>
  <input type="checkbox" name="notests" id="notests" bind:value={notests} checked={notests}>
  <label for="keepdata">Keep All Data</label>
  <input type="checkbox" name="keepdata" id="keepdata" bind:value={keepdata} checked={keepdata}>

  <label for="alias">Org Alias</label>
  <input bind:value={orgAlias} name="alias"/>
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