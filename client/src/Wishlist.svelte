<script lang="ts">
  import Msg from "./Msg.svelte";

  import ProductPrev from "./ProductPrev.svelte";

  import { isServerError, store } from "./store";
</script>

{#await store.wishlist()}
  <h1>Loading...</h1>
{:then wishlist}
  {#if isServerError(wishlist)}
    <Msg state={{ msg: wishlist.web_msg || wishlist.message, is_err: true }} />
  {:else}
    <div class="flex-container">
      {#each wishlist as product}
        <ProductPrev {product} />
      {/each}
    </div>
    {#if wishlist.length === 0}
      <h1>Nothing In Wishlist!</h1>
    {/if}
  {/if}
{/await}
