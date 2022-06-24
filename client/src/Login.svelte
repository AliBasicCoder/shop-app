<script lang="ts">
  import { routerStore } from "super-svelte-router";
  import Msg from "./Msg.svelte";

  import { isServerError, ServerError, store, User } from "./store";

  let is_reg = $routerStore.pathname == "/register";
  let name = "";
  let email = "";
  let password = "";
  let as_admin = $store.loginStatus === 2;
  let msg_state = { msg: "", is_err: true };

  if ($store.loginStatus >= 1 && !(as_admin && is_reg)) {
    routerStore.redirect("/");
  }

  function handleError(res: ServerError | User) {
    if (isServerError(res)) {
      msg_state = { msg: res.web_msg || res.message, is_err: true };
      console.error(res);
      return true;
    }
    return false;
  }

  async function submit() {
    if (!email || !password || (is_reg && !name)) {
      msg_state = { msg: "Please complete all missing fields", is_err: true };
      return;
    }
    if (!is_reg && !as_admin) {
      const res = await store.userLogin(email, password);
      if (handleError(res)) {
        return;
      }
      routerStore.redirect("/");
    }
    if (!is_reg && as_admin) {
      const res = await store.adminLogin(email, password);
      if (handleError(res)) {
        return;
      }
      routerStore.redirect("/");
    }
    if (is_reg && as_admin) {
      const res = await store.addAdmin(name, email, password);
      if (handleError(res)) {
        return;
      }
      msg_state = { msg: "Admin Added Successfully", is_err: false };
    }
    if (is_reg && !as_admin) {
      const res = await store.register(name, email, password);
      if (handleError(res)) {
        return;
      }
      routerStore.redirect("/");
    }
  }
</script>

<div class="form">
  {#if as_admin && is_reg}
    <h1>Add Admin</h1>
  {/if}
  {#if !as_admin && is_reg}
    <h1>Register</h1>
  {/if}
  {#if !is_reg}
    <h1>Login</h1>
  {/if}
  <Msg state={msg_state} />
  {#if is_reg}
    <input type="text" bind:value={name} placeholder="name" />
  {/if}
  <input type="text" bind:value={email} placeholder="email" />
  <input type="password" bind:value={password} placeholder="password" />
  {#if !is_reg}
    <div>
      As Admin?
      <input type="checkbox" bind:value={as_admin} />
    </div>
  {/if}
  <button on:click={submit} class="submit-btn">submit</button>
</div>
