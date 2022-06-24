<script lang="ts">
  export let rating: number;
  export let changeable = false;

  function set(n: number) {
    if (changeable) {
      rating = n;
    }
  }
</script>

<div class="stars" class:clickable={changeable}>
  <img
    src={rating >= 1 ? "/star-full.svg" : "/star-empty.svg"}
    alt="Star"
    on:click={() => set(rating === 1 ? 0 : 1)}
  />
  <img
    src={rating >= 2 ? "/star-full.svg" : "/star-empty.svg"}
    alt="Star"
    on:click={() => set(2)}
  />
  <img
    src={rating >= 3 ? "/star-full.svg" : "/star-empty.svg"}
    alt="Star"
    on:click={() => set(3)}
  />
  <img
    src={rating >= 4 ? "/star-full.svg" : "/star-empty.svg"}
    alt="Star"
    on:click={() => set(4)}
  />
  <img
    src={rating >= 5 ? "/star-full.svg" : "/star-empty.svg"}
    alt="Star"
    on:click={() => set(5)}
  />
</div>

<style>
  .stars img {
    width: 40px;
  }
  .stars.clickable img {
    cursor: pointer;
  }
  .stars {
    margin: 10px 0;
  }
</style>
