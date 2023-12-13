<script>
  import SummarizeComponent from "./SummarizeComponent.svelte";
  import UploadComponent from "./UploadComponent.svelte";
  import Tabs from "./Tabs.svelte";

  let items = [
    { label: "Summarize Org", value: 1, component: SummarizeComponent },
    { label: "Upload Summary", value: 2, component: UploadComponent },
  ];
</script>

<Tabs {items} />