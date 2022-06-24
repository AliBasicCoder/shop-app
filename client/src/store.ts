import { ReadableStore } from "store-pro";

enum LoginStatus {
  Not,
  User,
  Admin,
}

export interface StoreValue {
  loginStatus: LoginStatus;
  wishlistCache?: Product[];
  cartCache?: Product[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  token?: string;
}

export type Admin = User;

export interface Category {
  name: string;
  images: string[];
  _id: string;
  image?: string;
}

export interface Rating {
  user: string;
  rating: number;
  comment: string;
}

export interface Product {
  name: string;
  _id: string;
  brand: string;
  image: string;
  otherImages: string[];
  details: string;
  price: number;
  ratings: Rating[];
  rating: number;
  available: boolean;
  in_wishlist?: boolean;
  in_cart?: boolean;
}

export interface Order {
  user: User;
  products: Product[];
  _id: string;
  createdAt: string;
}

export interface ServerError {
  message: string;
  name?: string;
  stack: string;
  error: true;
  status: number;
  web_msg?: string;
}

export function isServerError(a: any): a is ServerError {
  return a.error === true;
}

export interface Image {
  _id: string;
  ext: string;
}

function handlePromise<T>(
  promise: Promise<Response>
): Promise<T | ServerError> {
  return promise
    .then((res) => {
      if (!res.ok) {
        return res.json().then((json) => {
          json.status = res.status;
          return json;
        });
      }
      return res.text();
    })
    .then((text) => {
      try {
        return JSON.parse(text) as T;
      } catch {
        return text;
      }
    });
}

class Store extends ReadableStore<StoreValue> {
  constructor() {
    let loginStatus: LoginStatus = 0;
    if (localStorage.getItem("admin-token")) {
      loginStatus = 2;
    }
    if (localStorage.getItem("user-token")) {
      loginStatus = 1;
    }
    super({ loginStatus });
  }
  async userLogin(email: string, password: string) {
    const result = await handlePromise<User>(
      fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
    );
    if (isServerError(result)) {
      return result;
    }
    localStorage.setItem("user-token", result.token);
    this.update((val) => ({ ...val, loginStatus: 1 }));
    return result;
  }
  async adminLogin(
    email: string,
    password: string
  ): Promise<User | ServerError> {
    const result = await handlePromise<Admin>(
      fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
    );
    if (isServerError(result)) {
      return result;
    }
    localStorage.setItem("admin-token", result.token);
    this.update((val) => ({ ...val, loginStatus: 2 }));
    return result;
  }
  async addAdmin(name: string, email: string, password: string) {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      return {
        ...new Error("NotLoggedIn"),
        web_msg: "Not Logged In As Admin!",
      } as ServerError;
    }
    return await handlePromise<Admin>(
      fetch("/api/admin/add-new", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      })
    );
  }
  async register(name: string, email: string, password: string) {
    const user = await handlePromise<User>(
      fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })
    );
    if (isServerError(user)) {
      return user;
    }
    localStorage.setItem("user-token", user.token);
    this.update((prev) => ({ ...prev, loginStatus: 1 }));
    return user;
  }
  getCategories() {
    return handlePromise<Category[]>(fetch("/api/categories"));
  }
  products() {
    return handlePromise<Product[]>(fetch("/api/products"));
  }
  product(id: string) {
    return handlePromise<Product>(fetch(`/api/product/${id}`));
  }
  async allOrders() {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      return {
        ...new Error("NotLoggedIn"),
        web_msg: "Not Logged In As Admin!",
      } as ServerError;
    }
    return await handlePromise<Order[]>(
      fetch("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
  }
  async addProduct(
    name: string,
    brand: string,
    details: string,
    price: number,
    available: boolean,
    category: string,
    mainImage: File,
    otherImages: FileList
  ) {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      return {
        ...new Error("NotLoggedIn"),
        web_msg: "Not Logged In As Admin!",
      } as ServerError;
    }
    const req = [
      fetch("/api/admin/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": mainImage.type,
        },
        body: mainImage,
      }).then((res) => res.json()) as Promise<Image>,
    ];
    for (let i = 0; i < otherImages.length; i++) {
      const image = otherImages[i];
      req.push(
        fetch("/api/admin/image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": image.type,
          },
          body: image,
        }).then((res) => res.json()) as Promise<Image>
      );
    }
    const images = await Promise.all(req);
    return (await (
      await fetch("/api/admin/add-product", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          brand,
          price,
          available,
          category,
          details,
          image: images[0]._id,
          otherImages: images.slice(1).map((img) => img._id),
          rating: 0,
          ratings: [],
        }),
      })
    ).json()) as Product;
  }
  async addCategory(name: string, image: File) {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      return {
        ...new Error("NotLoggedIn"),
        web_msg: "Not Logged In As Admin!",
      } as ServerError;
    }
    const img = await handlePromise<Image>(
      fetch("/api/admin/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": image.type,
        },
        body: image,
      })
    );
    if (isServerError(img)) {
      return img;
    }
    return await handlePromise<Category>(
      fetch("/api/admin/add-category", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, images: [img._id] }),
      })
    );
  }
  logout() {
    localStorage.removeItem("user-token");
    localStorage.removeItem("admin-token");
    this.update((old) => ({ ...old, loginStatus: 0 }));
  }
  search(query: string) {
    return handlePromise<Product[]>(fetch(`/api/search/${query}`));
  }
  async cart() {
    const token = localStorage.getItem("user-token");
    if (!token) {
      return {
        ...new Error("NotLoggedIn"),
        web_msg: "Not Logged In!",
      } as ServerError;
    }
    return await handlePromise<Product[]>(
      fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
  }
  async addToWishlist(id: string) {
    const token = localStorage.getItem("user-token");
    if (!token) {
      return {
        ...new Error("NotLoggedIn"),
        web_msg: "Not Logged In!",
      } as ServerError;
    }
    await fetch(`/api/add-to-wishlist/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  async addToCart(id: string) {
    const token = localStorage.getItem("user-token");
    if (!token) {
      return {
        ...new Error("NotLoggedIn"),
        web_msg: "Not Logged In!",
      } as ServerError;
    }
    return await handlePromise<null>(
      fetch(`/api/add-to-cart/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
  }
  async removeFromCart(id: string) {
    const token = localStorage.getItem("user-token");
    if (!token) {
      return {
        ...new Error("NotLoggedIn"),
        web_msg: "Not Logged In!",
      } as ServerError;
    }
    return await handlePromise<null>(
      fetch(`/api/remove-from-cart/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
  }
  async removeFromWishlist(id: string) {
    const token = localStorage.getItem("user-token");
    if (!token) {
      return {
        ...new Error("NotLoggedIn"),
        web_msg: "Not Logged In!",
      } as ServerError;
    }
    await handlePromise<null>(
      fetch(`/api/remove-from-wishlist/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
  }
  async in_wishlist(id: string): Promise<boolean> {
    const token = localStorage.getItem("user-token");
    if (!token) {
      return false;
    }
    let { wishlistCache } = this.get();
    if (!wishlistCache) {
      wishlistCache = await (
        await fetch("/api/wishlist", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      ).json();
    }
    for (const product of wishlistCache) {
      if (product._id === id) {
        return true;
      }
    }
    return false;
  }
  async in_cart(id: string): Promise<boolean> {
    const token = localStorage.getItem("user-token");
    if (!token) {
      return false;
    }
    let { cartCache } = this.get();
    if (!cartCache) {
      cartCache = await (
        await fetch("/api/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      ).json();
    }
    for (const product of cartCache) {
      if (product._id === id) {
        return true;
      }
    }
    return false;
  }
  async placeOrder() {
    const token = localStorage.getItem("user-token");
    if (!token) {
      return {
        ...new Error("NotLoggedIn"),
        web_msg: "Not Logged In!",
      } as ServerError;
    }
    return await handlePromise<null>(
      fetch("/api/place-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
  }
  async orders() {
    const token = localStorage.getItem("user-token");
    if (!token) {
      return {
        ...new Error("NotLoggedIn"),
        web_msg: "Not Logged In!",
      } as ServerError;
    }
    return await handlePromise<Order[]>(
      fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
  }
  async wishlist() {
    const token = localStorage.getItem("user-token");
    if (!token) {
      return {
        ...new Error("Not Logged In"),
        web_msg: "Not Logged In!",
      } as ServerError;
    }
    return (
      (await (
        await fetch("/api/wishlist", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      ).json()) as Product[]
    ).map((item) => ({ ...item, in_wishlist: true })) as Product[];
  }
  async addRating(product_id: string, rating: number, comment: string) {
    const token = localStorage.getItem("user-token");
    if (!token) {
      return {
        ...new Error("Not Logged In"),
        web_msg: "Not Logged In!",
      } as ServerError;
    }
    return await handlePromise<{ rating: number; ratings: Rating[] }>(
      fetch("/api/add-rating", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id, rating, comment }),
      })
    );
  }
}

export const store = new Store();
