<script lang="ts">
  import { Router, link } from "super-svelte-router";
  // import AddCat from "./AddCat.svelte";
  // import AddProduct from "./AddProduct.svelte";
  // import Cart from "./Cart.svelte";
  // import Login from "./Login.svelte";
  // import Main from "./Main.svelte";
  // import Wishlist from "./Wishlist.svelte";
  // import Orders from "./Orders.svelte";
  // import Product from "./Product.svelte";
  // import Search from "./Search.svelte";
  import NotFound from "./NotFound.svelte";
  import SearchBar from "./SearchBar.svelte";
  import { store } from "./store";
  const routes = [
    {
      path: "/",
      component: () => import("./Main.svelte"),
      lazyLoad: true,
    },
    {
      path: "/login",
      component: () => import("./Login.svelte"),
      lazyLoad: true,
    },
    {
      path: "/register",
      component: () => import("./Login.svelte"),
      lazyLoad: true,
    },
    {
      path: "/product/:id",
      component: () => import("./Product.svelte"),
      lazyLoad: true,
    },
    {
      path: "/add-product",
      component: () => import("./AddProduct.svelte"),
      lazyLoad: true,
    },
    {
      path: "/add-category",
      component: () => import("./AddCat.svelte"),
      lazyLoad: true,
    },
    {
      path: "/search/:query",
      component: () => import("./Search.svelte"),
      lazyLoad: true,
    },
    {
      path: "/cart",
      component: () => import("./Cart.svelte"),
      lazyLoad: true,
    },
    {
      path: "/orders",
      component: () => import("./Orders.svelte"),
      lazyLoad: true,
    },
    {
      path: "/wishlist",
      component: () => import("./Wishlist.svelte"),
      lazyLoad: true,
    },
    {
      path: "**",
      component: NotFound,
    },
    // {
    //   path: "/",
    //   component: Main,
    // },
    // {
    //   path: "/login",
    //   component: Login,
    // },
    // {
    //   path: "/register",
    //   component: Login,
    // },
    // {
    //   path: "/product/:id",
    //   component: Product,
    // },
    // {
    //   path: "/add-product",
    //   component: AddProduct,
    // },
    // {
    //   path: "/add-category",
    //   component: AddCat,
    // },
    // {
    //   path: "/search/:query",
    //   component: Search,
    // },
    // {
    //   path: "/cart",
    //   component: Cart,
    // },
    // {
    //   path: "/orders",
    //   component: Orders,
    // },
    // {
    //   path: "/wishlist",
    //   component: Wishlist,
    // },
    // {
    //   path: "**",
    //   component: NotFound,
    // },
  ];
  function logout(e: Event) {
    e.preventDefault();
    if (confirm("Are You Sure You Want To Logout?")) {
      store.logout();
    }
  }
  let show = false;
</script>

<div class="navbar">
  <div class="logo">
    <a href="/" use:link> Shopping App </a>
  </div>
  <div class="big">
    <SearchBar width="34vw" transform="translate(0, -5px)" />
  </div>
  <div class="nav">
    <button on:click={() => (show = !show)}>
      <i class="fa-solid fa-magnifying-glass" aria-label="search" />
    </button>
    {#if $store.loginStatus == 0}
      <a href="/register" use:link>Register</a>
      <a href="/login" use:link>Login</a>
    {/if}
    {#if $store.loginStatus == 1}
      <a href="/cart" use:link>
        <i class="fa-solid fa-cart-shopping" aria-label="cart" />
      </a>
      <a href="/wishlist" use:link
        ><i class="fa-solid fa-heart" aria-label="wishlist" /></a
      >
      <a href="/orders" use:link>Orders</a>
      <a on:click={logout} href="/#">Logout</a>
    {/if}
    {#if $store.loginStatus == 2}
      <a href="/add-category" use:link>Add Category</a>
      <a href="/add-product" use:link>Add Product</a>
      <a href="/register" use:link>Add Admin</a>
      <a on:click={logout} href="/#">Logout</a>
    {/if}
  </div>
</div>
{#if show}
  <div class="small">
    <SearchBar />
  </div>
{/if}
<div class="content">
  <Router {routes} />
</div>
<div class="footer">
  <div class="details">
    this is an application to show my skills with:<br />
    HTML, CSS, JS, Svelte, Node.JS, Express and MongoDB<br />
    you could find the source code for this project
    <a href="/#">here</a><br /><br />
    AliBasicCoder 2022 (c)
  </div>
  <div class="links">
    <a href="https://github.com/AliBasicCoder" target="_black">
      <img src="/github.svg" alt="My Github" />
    </a>
    <!-- <a href="https://www.npmjs.com/~ali_ahmed">
      <img src="/npm.svg" alt="My NPM Account" />
    </a> -->
    <a href="https://twitter.com/aliahmd94438225" target="_black">
      <img src="/twitter.svg" alt="My Twitter" />
    </a>
    <a href="https://www.freelancer.com/u/aliahmedreda34" target="_black">
      <img src="/freelancer.svg" alt="My Freelancer Account" />
    </a>
    <a
      href="https://www.upwork.com/freelancers/~01b73ea23576574c7c"
      target="_black"
    >
      <img src="/upwork.svg" alt="My Upwork Account" />
    </a>
  </div>
</div>

<style>
  .footer {
    width: 100%;
    font-size: 1.5rem;
    padding: 20px 10px 40px 10px;
    background-color: #f6f6f6;
    color: grey;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
  }
  .links {
    display: flex;
    gap: 20px;
  }
  .links img {
    width: 50px;
    height: 50px;
  }
  .footer a {
    color: blue;
    font-size: unset;
    margin-left: 0;
  }
  /* .footer .details {
    max-width: 500px;
  } */
  .navbar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 20px;
    background-color: var(--bg-color);
    color: white;
    /* position: fixed;
    width: 100vw; */
  }
  .content {
    padding: 10px 10px 40px 10px;
    min-height: 90vh;
  }
  a {
    font-size: 1.5rem;
    margin-left: 15px;
    text-decoration: none;
    color: unset;
  }
  .logo a {
    margin: 0;
  }
  button {
    background: none;
    padding: none;
    color: white;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    display: none;
  }
  .small {
    display: none;
  }
  @media (max-width: 875px) {
    .small {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px;
    }
    .big {
      display: none;
    }
    button {
      display: inline-block;
    }
  }
</style>
