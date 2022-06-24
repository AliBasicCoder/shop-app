<script lang="ts">
  import { routerStore } from "super-svelte-router";
  import Msg from "./Msg.svelte";

  import ProductPrev from "./ProductPrev.svelte";
  import { store, Product, isServerError } from "./store";
  let msg_state = { msg: "", is_err: false };

  if ($store.loginStatus !== 1) {
    routerStore.redirect("/");
  }

  let cart: Product[];
  $: total = cart?.reduce((pv, product) => pv + product.price, 0);
  store.cart().then((data) => {
    if (isServerError(data)) {
      routerStore.redirect("/");
      alert(data.web_msg);
      return;
    }
    cart = data;
  });

  async function placeOrder() {
    const error = await store.placeOrder();
    if (isServerError(error)) {
      msg_state = { msg: error.web_msg, is_err: true };
      return;
    }
    routerStore.redirect("/orders");
  }
</script>

<Msg state={msg_state} />
{#if cart}
  <div class="flex-container">
    {#each cart as product}
      <ProductPrev {product} />
    {/each}
  </div>
  {#if cart.length === 0}
    <h1>Nothing In Cart!</h1>
  {/if}
  <h1>Total: {total}$</h1>
  {#if cart.length >= 1}
    <button class="submit-btn" on:click={placeOrder}>Place Order</button>
  {/if}
{:else}
  <h1>Loading...</h1>
{/if}
