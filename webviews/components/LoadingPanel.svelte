<script >
  import Spinner from "./Spinner.svelte";
  let summary;
</script>
{#if !summary}
    <Spinner />
{/if}
{#if summary}
    <h1> World </h1>
{/if}