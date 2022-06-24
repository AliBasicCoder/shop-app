<script lang="ts">
  import { routerStore } from "super-svelte-router";
  import Msg from "./Msg.svelte";

  import ProductPrev from "./ProductPrev.svelte";
  import { isServerError, store } from "./store";

  if ($store.loginStatus === 0 || $store.loginStatus === 2) {
    routerStore.redirect("/");
  }
</script>

{#await store.orders()}
  <h1>Loading...</h1>
{:then orders}
  {#if isServerError(orders)}
    <Msg state={{ msg: orders.web_msg || orders.message, is_err: true }} />
  {:else}
    {#each orders as order}
      <div class="order">
        <h1>Order #{order._id}</h1>
        <h3>Created At {new Date(order.createdAt).toLocaleString()}</h3>
        <div class="flex-container">
          {#each order.products as product}
            <ProductPrev {product} />
          {/each}
        </div>
        <hr />
      </div>
    {/each}
    {#if orders.length === 0}
      <h1>No Orders!</h1>
    {/if}
  {/if}
{/await}
