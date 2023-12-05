<script >
  import Spinner from "./Spinner.svelte";
  let summary;


</script>
<h1> Hello </h1>
{#if !summary}
    <Spinner />
{/if}
{#if summary}
    <h1> World </h1>
{/if}