<script lang="ts">
  import { routerStore } from "super-svelte-router";
  import Msg from "./Msg.svelte";
  import ProductComponent from "./Product.svelte";
  import { store, ServerError, isServerError, Category } from "./store";

  let name = "";
  let brand = "";
  let details = "";
  let price = 1;
  let available = true;
  let category: string;
  let fileInput1: HTMLInputElement;
  let fileInput2: HTMLInputElement;
  let msg_state = { msg: "", is_err: true };
  let prev_product = {
    name,
    brand,
    details,
    price,
    image: "",
    otherImages: [],
    _id: "",
    rating: 0,
    ratings: [],
    available,
  };
  $: {
    prev_product.name = name;
    prev_product.brand = brand;
    prev_product.price = price;
    prev_product.available = available;
    prev_product.details = details;
  }
  if ($store.loginStatus !== 2) {
    routerStore.redirect("/");
  }

  function handleError<T>(res: ServerError | T) {
    if (isServerError(res)) {
      msg_state = { msg: res.web_msg || res.message, is_err: true };
      console.error(res);
      return true;
    }
    return false;
  }

  async function submit() {
    if (
      !name ||
      !brand ||
      !details ||
      !category ||
      fileInput1.files.length === 0
    ) {
      msg_state = {
        msg: "Please Complete All Missing Fields",
        is_err: true,
      };
      return;
    }
    msg_state = {
      msg: "Uploading...",
      is_err: false,
    };
    if (
      handleError(
        await store.addProduct(
          name,
          brand,
          details,
          price,
          available,
          category,
          fileInput1.files[0],
          fileInput2.files
        )
      )
    ) {
      return;
    }

    msg_state = {
      msg: "Product Added Successfully!",
      is_err: false,
    };
    name = "";
    brand = "";
    details = "";
    price = 1;
    available = true;

    prev_product = {
      name,
      brand,
      details,
      price,
      image: "",
      otherImages: [],
      _id: "",
      rating: 0,
      ratings: [],
      available,
    };
  }

  let categories: Category[];

  store.getCategories().then((res) => {
    if (isServerError(res)) {
      handleError(res);
      return;
    }
    categories = res;
  });
  function mainChange() {
    if (fileInput1.files.length === 0) {
      return;
    }
    prev_product.image = URL.createObjectURL(fileInput1.files[0]);
  }

  function otherChange() {
    for (let i = 0; i < fileInput2.files.length; i++) {
      prev_product.otherImages[i] = URL.createObjectURL(fileInput2.files[i]);
    }
  }
</script>

<div class="form">
  <Msg state={msg_state} />
  <input type="text" placeholder="name" bind:value={name} />
  <input type="text" placeholder="brand" bind:value={brand} />
  <textarea type="text" placeholder="details" bind:value={details} />
  <input type="number" placeholder="price" bind:value={price} />
  <div>
    {#if categories}
      Category:
      <select bind:value={category}>
        {#each categories as category}
          <option value={category._id}>{category.name}</option>
        {/each}
      </select>
    {:else}
      <h1>Loading...</h1>
    {/if}
  </div>
  <div>
    Available? <input type="checkbox" bind:value={available} checked />
  </div>
  <div>
    Main Image: <input
      type="file"
      bind:this={fileInput1}
      on:change={mainChange}
    />
  </div>
  <div>
    Other Images: <input
      type="file"
      multiple
      bind:this={fileInput2}
      on:change={otherChange}
    />
  </div>
  <button on:click={submit} class="submit-btn">Submit</button>
</div>
<ProductComponent is_prev={true} {prev_product} params={{ id: "" }} />

<style>
  textarea {
    resize: vertical;
    margin-bottom: 10px;
    padding: 20px;
  }
</style>
