<script lang="ts">
  import { link } from "super-svelte-router";
  import Stars from "./Stars.svelte";
  import { Product, store } from "./store";

  export let product: Product;

  function toggleWishlist() {
    if (product.in_wishlist) {
      store.removeFromWishlist(product._id).then(() => {
        product.in_wishlist = false;
      });
    } else {
      store.addToWishlist(product._id).then(() => {
        product.in_wishlist = true;
      });
    }
  }
  if (product.in_wishlist === undefined) {
    store.in_wishlist(product._id).then((result) => {
      product.in_wishlist = result;
    });
  }
</script>

<div class="product">
  <a class="image" href="/product/{product._id}" use:link>
    <img src="/api/image/{product.image}" alt="Product" />
  </a>
  <div class="data">
    <div class="name">{product.name}</div>
    <div class="brand">
      By <a href="/search/brand:{product.brand.replaceAll(' ', '_')}" use:link>
        {product.brand}
      </a>
    </div>
    <Stars rating={product.rating} />
    <!-- <a href="/product/{product._id}#ratings" use:link>{product.ratings.length}</a> -->
    <div class="price">{product.price}$</div>
  </div>
  <button class="wishlist" on:click={toggleWishlist}>
    {#if product.in_wishlist}
      <img src="/heart-red.svg" alt="Heart" />
    {:else}
      <img src="/heart.svg" alt="Heart" />
    {/if}
  </button>
</div>

<style>
  .product {
    display: flex;
    flex-direction: column;
    width: 370px;
    position: relative;
  }
  .image {
    background-color: #f8f8f8;
    height: 330px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .image img {
    /* max-width: 350px; */
    max-width: 100%;
    max-height: 100%;
  }
  .name {
    font-size: 1.5rem;
    font-weight: bold;
  }
  .data {
    padding: 10px;
  }
  .price {
    font-size: 1.5rem;
    font-weight: bold;
  }
  .wishlist {
    width: 60px;
    height: 60px;
    background-color: white;
    border: none;
    cursor: pointer;
    position: absolute;
    right: 10px;
    top: 260px;
    padding: 12px;
    border-radius: 37px;
  }
  @media (max-width: 820px) {
    .product {
      width: 100vw;
      flex-direction: row;
      padding-bottom: 10px;
      padding-top: 10px;
    }
    .image {
      height: 135px;
      width: 200px;
      background: none;
    }
    .wishlist {
      top: 60%;
      /* right: 10px; */
    }
    .wishlist {
      width: 50px;
      height: 50px;
    }
    .name,
    .price {
      font-size: 24px;
      padding-bottom: 5px;
    }
    .brand {
      font-size: 18px;
    }
  }
  @media (max-width: 510px) {
    .image {
      height: 77px;
      width: 100px;
    }
    /* .name,
    .price {
      font-size: 3rem;
      padding-bottom: 5px;
    }
    .brand {
      font-size: 1.5rem;
    } */
  }
</style>
