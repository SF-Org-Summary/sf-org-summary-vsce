<br />
<h2>Upload Summary</h2>
<br />
<p>If you want to use the summaries in Salesforce for logging/reporting puproses, you can upload a summary to an Org using our prepacked data model and upload feature below. Make sure to install the <a href="https://github.com/SF-Org-Summary/sf-org-summary-sfapp">Org Summary Salesforce App</a> before executing any upload.</p>
<br/>

<label for="monitoringalias">Monitoring Org Alias</label>
<input bind:value={monitoringalias} name="monitoringalias"/>
<br/>
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

  <script>
     let monitoringalias ='';

    function uploadSummaryToOrg() {
        let flags = {};
        flags['targetusername'] =  monitoringalias;
        tsvscode.postMessage({type:"upload", value: flags});
    }
  </script>