<script lang="ts">
  import { onDestroy } from "svelte";

  export let state: {
    msg: string;
    is_err: boolean;
  };
  let timeout: any;

  $: {
    if (state.msg) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        state.msg = "";
        state.is_err = true;
      }, 3000);
    }
  }

  onDestroy(() => {
    clearTimeout(timeout);
  });
</script>

{#if state.msg}
  <div class:err={state.is_err} class="msg">
    {state.msg}
  </div>
{/if}

<style>
  .msg {
    padding: 20px;
    color: white;
    /* margin-bottom: 20px; */
    background-color: green;
  }
  .err {
    background-color: red;
  }
</style>
