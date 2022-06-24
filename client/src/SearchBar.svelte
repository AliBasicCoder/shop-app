<script lang="ts">
  import { routerStore } from "super-svelte-router";

  export let width = "100%";
  export let transform = "";
  $: query = $routerStore.params.query || "";

  function search(e: KeyboardEvent) {
    if (e.key !== "Enter") {
      return;
    }
    // @ts-ignore
    routerStore.redirect(`/search/${e.target.value}`);
  }
</script>

<input
  style:width
  style:transform
  type="text"
  placeholder="Search Shopping App..."
  value={query}
  on:keyup={search}
/>

<style>
  input {
    padding: 10px;
    /* width: 100%; */
  }
</style>
