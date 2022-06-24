<script lang="ts">
  import Msg from "./Msg.svelte";
  import ProductPrev from "./ProductPrev.svelte";
  import { isServerError, store } from "./store";

  export let params;
</script>

{#await store.search(params.query)}
  <h1>Loading...</h1>
{:then products}
  {#if isServerError(products)}
    <Msg state={{ msg: products.web_msg || products.message, is_err: true }} />
  {:else}
    <div class="flex-container">
      {#each products as product}
        <ProductPrev {product} />
      {/each}
      {#if products.length === 0}
        <h1>No Products Found!</h1>
      {/if}
    </div>
  {/if}
{/await}
