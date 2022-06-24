<script lang="ts">
  import { routerStore, link } from "super-svelte-router";
  import Msg from "./Msg.svelte";
  import Stars from "./Stars.svelte";
  import { store, Product, isServerError } from "./store";

  export let params: { id: string };
  export let is_prev: boolean;
  export let prev_product: Product;

  let product: Product;
  let currentImg = "";
  let rating = 0;
  let comment = "";

  $: {
    if (is_prev) {
      product = prev_product;
      if (!currentImg) {
        currentImg = product.image;
      }
      if (product.name === "") {
        currentImg = "";
      }
    }
  }

  if (is_prev) {
    product = prev_product;
  } else {
    store
      .product(params.id)
      .then((data) => {
        if (isServerError(data)) {
          routerStore.redirect("/404");
          return;
        }
        product = data;
        currentImg = product.image;
      })
      .catch((err) => {
        console.error(err);
        routerStore.redirect("/404");
      });

    store
      .in_cart(params.id)
      .then((result) => {
        product.in_cart = result;
      })
      .catch(() => {});
  }

  function toggleCart() {
    if (is_prev) {
      return;
    }
    if (product.in_cart) {
      store
        .removeFromCart(product._id)
        .then(() => {
          product.in_cart = false;
        })
        .catch((err) => {
          console.error(err);
          alert("Unexpected Error");
        });
    } else {
      store
        .addToCart(product._id)
        .then(() => {
          product.in_cart = true;
        })
        .catch((err) => {
          console.error(err);
          alert("Unexpected Error");
        });
    }
  }

  let msg_state = { msg: "", is_err: true };

  async function postRating() {
    if (!comment) {
      msg_state = { msg: "Please Add Comment!", is_err: true };
      return;
    }
    const res = await store.addRating(product._id, rating, comment);
    if (isServerError(res)) {
      msg_state = { msg: res.web_msg || res.message, is_err: true };
      return;
    }
    msg_state = { msg: "Rating Added Successfully!", is_err: false };
    product.rating = res.rating;
    product.ratings = res.ratings;
    rating = 0;
    comment = "";
  }
</script>

{#if product}
  <div class="product">
    <div class="img-prev">
      <img
        src={is_prev ? product.image : `/api/image/${product.image}`}
        alt="Main Product"
        class:selected={currentImg === product.image}
        on:click={() => (currentImg = product.image)}
      />
      {#each product.otherImages as image}
        <img
          src={is_prev ? image : `/api/image/${image}`}
          alt="Product"
          class:selected={currentImg === image}
          on:click={() => (currentImg = image)}
        />
      {/each}
    </div>
    <div class="main-img">
      <img
        src={is_prev ? currentImg : `/api/image/${currentImg}`}
        alt="Product"
      />
    </div>
    <div class="data">
      <div class="name">{product.name}</div>
      <div class="brand">
        Brand: <a
          href="/search/brand:{product.brand.replaceAll(' ', '_')}"
          use:link
        >
          {product.brand}
        </a>
      </div>
      <div class="price">{product.price}$</div>
      <Stars rating={product.rating} />
      <div class="details">
        {product.details}
      </div>
      <button
        on:click={toggleCart}
        class="submit-btn"
        class:remove={product.in_cart}
      >
        {#if product.in_cart}
          Remove From Cart
        {:else}
          Add To Cart
        {/if}
      </button>
    </div>
  </div>
  <div class="ratings">
    <div class="add-rating">
      <Msg state={msg_state} />
      <h2>Add Rating!</h2>
      <Stars bind:rating changeable />
      <textarea placeholder="comment" bind:value={comment} />
      <button class="submit-btn" on:click={postRating}>Post</button>
    </div>
    {#each product.ratings as rating}
      <div class="rating">
        user: {rating.user}
        <Stars rating={rating.rating} />
        <div class="comment">
          {rating.comment}
        </div>
      </div>
    {/each}
  </div>
{:else}
  <h1>Loading...</h1>
{/if}

<style>
  textarea {
    max-width: 600px;
    width: 90vw;
    height: 100px;
    resize: vertical;
    padding: 20px;
    margin-bottom: 10px;
    display: block;
  }
  .add-rating {
    margin-bottom: 20px;
  }
  .img-prev {
    display: flex;
    flex-direction: column;
    gap: 13px;
    max-height: 800px;
    padding-right: 10px;
    min-width: 125px;
    overflow: auto;
  }
  .img-prev img {
    width: 100px;
    cursor: pointer;
  }
  .main-img img {
    width: 90vw;
    max-width: 600px;
    max-height: 555px;
  }
  .product {
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin-bottom: 20px;
    /* max-height: 555px; */
  }
  .name,
  .price {
    font-size: 1.5rem;
    font-weight: bold;
  }
  .selected {
    border: #008cff solid 4px;
  }
  .details {
    margin-bottom: 10px;
    font-size: 1.3rem;
  }
  @media (max-width: 1130px) {
    .product {
      flex-direction: column;
    }
    .img-prev {
      flex-direction: row;
      min-height: 125px;
      padding-bottom: 10px;
    }
  }
  @media (max-width: 750px) {
    .details {
      font-size: 2rem;
    }
    .name,
    .price {
      font-size: 3rem;
    }
    .brand {
      font-size: 2rem;
    }
  }
  .remove {
    background-color: red;
  }
</style>
