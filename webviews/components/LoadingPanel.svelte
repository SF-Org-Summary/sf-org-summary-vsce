<script>
  import { onMount } from "svelte";
  import Spinner from "./Spinner.svelte";
  let statusMessage = "";

  window.addEventListener("message", (event) => {
            const message = event.data;
            switch (message.command) {
                case "status":
                statusMessage = message.payload.value;
            }
        });

  </script>

<br>
{#if statusMessage}
<h1>{statusMessage}</h1>
{/if}

<Spinner />