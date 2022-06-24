<script lang="ts">
  import { routerStore } from "super-svelte-router";

  import Category from "./Category.svelte";

  import Msg from "./Msg.svelte";
  import { isServerError, ServerError, store } from "./store";
  let name = "";
  let fileInput: HTMLInputElement;
  let msg_state = { msg: "", is_err: true };
  let category = {
    name,
    images: [],
    _id: "",
    image: "",
  };
  $: {
    category.name = name;
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
    if (!name || fileInput.files.length === 0) {
      msg_state = { msg: "Please Complete Missing Fields", is_err: true };
      return;
    }
    msg_state = { msg: "Uploading...", is_err: false };
    if (handleError(await store.addCategory(name, fileInput.files[0]))) {
      return;
    }
    msg_state = { msg: "Uploaded Successfully", is_err: false };
    name = "";
    category = {
      name,
      images: [],
      _id: "",
      image: "",
    };
  }

  function selectImg() {
    if (fileInput.files.length === 0) {
      return;
    }
    category.image = URL.createObjectURL(fileInput.files[0]);
  }
</script>

<div class="form">
  <Msg state={msg_state} />
  <h1>Add Category</h1>
  <Category {category} is_prev={true} />
  <input type="text" placeholder="name" bind:value={name} />
  <div>
    Image: <input type="file" bind:this={fileInput} on:change={selectImg} />
  </div>
  <button on:click={submit} class="submit-btn">Submit</button>
</div>
