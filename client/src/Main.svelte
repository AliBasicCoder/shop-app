<script lang="ts">
  import Category from "./Category.svelte";
  import Msg from "./Msg.svelte";
  import ProductPrev from "./ProductPrev.svelte";
  import { isServerError, store } from "./store";
</script>

{#if $store.loginStatus === 2}
  {#await store.allOrders()}
    <h1>Loading...</h1>
  {:then orders}
    {#if isServerError(orders)}
      <Msg state={{ msg: orders.web_msg || orders.message, is_err: true }} />
    {:else}
      {#each orders as order}
        <div class="order">
          <h1>Order #{order._id}</h1>
          <h3>Created By {order.user.email}</h3>
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
{:else}
  {#await store.getCategories()}
    <h1>Loading...</h1>
  {:then categories}
    {#if isServerError(categories)}
      <Msg
        state={{ msg: categories.web_msg || categories.message, is_err: true }}
      />
    {:else}
      <div class="flex-container column center small-gap">
        <h1 class="title">Check Our Different Categories</h1>
        <div class="flex-container center small-gap">
          {#each categories as category}
            <Category {category} />
          {/each}
          {#if categories.length === 0}
            <h1>Nothing To Show!</h1>
          {/if}
        </div>
      </div>
    {/if}
  {/await}
{/if}

<style>
  .title {
    font-size: 3rem;
    font-weight: 200;
    margin-top: 10px;
  }
  @media (max-width: 450px) {
    .title {
      font-size: 2.6rem;
    }
  }
</style>
