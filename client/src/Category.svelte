<script lang="ts">
  import { link } from "super-svelte-router";
  import type { Category } from "./store";

  export let category: Category;
  export let is_prev = false;
  $: img_link = is_prev ? category.image : `/api/image/${category.images[0]}`;
</script>

<a
  href="/search/category:{category.name}"
  class="cat"
  style="background: url({img_link});"
  use:link
>
  <h1>{category.name}</h1>
</a>

<style>
  .cat {
    display: block !important;
    --width: clamp(300px, 47vw, 500px);
    width: var(--width);
    height: calc(var(--width) * 0.6);
    transition: transform 1s ease;
    overflow: hidden;
    background-color: #b9b9b9;
    position: relative;
    background-size: cover !important;
    box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.2);
  }
  .cat:hover {
    transform: scale(1.05);
  }
  /* .cat img {
    height: 100%;
    filter: brightness(0.8);
  } */
  .cat h1 {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    text-transform: uppercase;
    font-size: 2.5rem;
  }

  @media (max-width: 835px) {
    .cat {
      --width: clamp(250px, 46vw, 450px);
    }
  }

  @media (max-width: 625px) {
    .cat {
      --width: 90vw;
    }
  }
</style>
