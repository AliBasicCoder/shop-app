require("dotenv").config();
const express = require("express");
require("express-async-errors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const app = express();
app.use(bodyParser.raw({ limit: "10mb", type: "image/*" }));
app.use(bodyParser.json());
app.use(require("compression")());

function required(type) {
  return {
    type,
    required: true,
  };
}

const productSchema = new mongoose.Schema(
  {
    name: required(String),
    available: required(Boolean),
    image: required(mongoose.Schema.Types.ObjectId),
    otherImages: required([mongoose.Schema.Types.ObjectId]),
    details: required(String),
    price: required(Number),
    brand: required(String),
    ratings: [
      {
        user: required(mongoose.Schema.Types.ObjectId),
        rating: required(Number),
        comment: required(String),
      },
    ],
    rating: required(Number),
    category: required(mongoose.Schema.Types.ObjectId),
  },
  { timestamps: true }
);

const Product = mongoose.model("product", productSchema);

const userSchema = new mongoose.Schema(
  {
    name: required(String),
    password: required(String),
    email: required(String),
    cart: required([mongoose.Schema.Types.ObjectId]),
    wishlist: required([mongoose.Schema.Types.ObjectId]),
    orders: required([mongoose.Schema.Types.ObjectId]),
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

const orderSchema = new mongoose.Schema(
  {
    user: required(mongoose.Schema.Types.ObjectId),
    products: required([mongoose.Schema.Types.ObjectId]),
  },
  { timestamps: true }
);

const Order = new mongoose.model("order", orderSchema);

const adminSchema = new mongoose.Schema(
  {
    name: required(String),
    password: required(String),
    email: required(String),
  },
  { timestamps: true }
);

const Admin = new mongoose.model("admin", adminSchema);

const imageSchema = new mongoose.Schema(
  {
    data: required(Buffer),
    ext: required(String),
  },
  { timestamps: true }
);

const Image = new mongoose.model("image", imageSchema);

const categorySchema = new mongoose.Schema(
  {
    name: required(String),
    images: required([mongoose.Schema.Types.ObjectId]),
  },
  { timestamps: true }
);

const Category = new mongoose.model("category", categorySchema);

app.get("/api/image/:id", async (req, res) => {
  const image = await Image.findById(req.params.id);
  if (!image) {
    throw new Error("404: ImageNotFound, Image Not Found!");
  }
  res.send(image.data);
});

app.get("/api/categories", async (req, res) => {
  res.send(await Category.find({}));
});

app.post("/api/admin/add-category", protect2, async (req, res) => {
  res.send(await Category.create({ ...req.body }));
});

app.get("/api/products", async (req, res) => {
  res.send(await Product.find({}));
});

app.get("/api/product/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new Error("404: ProductNotFound, Product Not Found!");
  }
  res.send(product);
});

app.post("/api/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    throw new Error("400: MissingData, Missing Data!");
  }
  if (await User.findOne({ email })) {
    throw new Error("400: UserAlreadyExists, User Already Exists!");
  }
  // this 2 lines can never fail
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({
    ...req.body,
    password: hashedPassword,
  });
  res.status(201).send({
    ...user._doc,
    password: undefined,
    token: generateToken(user._id),
  });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Error("400: MissingData, Missing Data!");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("400: UserNotFound, User Not Found!");
  }
  if (await bcrypt.compare(password, user.password)) {
    res.json({
      ...user._doc,
      password: undefined,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
  }
});

async function protect(req, res, next) {
  if (req.headers?.authorization?.startsWith("Bearer")) {
    try {
      let token = req.headers?.authorization.split(" ")[1];
      if (!token) {
        return res.sendStatus(401);
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.sendStatus(401);
      }
      return next();
    } catch (err) {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
}

app.get("/api/me", protect, (req, res) => {
  res.send(req.user);
});

app.get("/api/wishlist", protect, async (req, res) => {
  const wishlist = await Promise.all(
    req.user.wishlist.map((id) => Product.findById(id))
  );
  res.send(wishlist);
});

app.get("/api/cart", protect, async (req, res) => {
  const cart = await Promise.all(
    req.user.cart.map((id) => Product.findById(id))
  );
  res.send(cart);
});

app.get("/api/orders", protect, async (req, res) => {
  const orders = await Promise.all(
    req.user.orders.map((order_id) =>
      Order.findById(order_id).then((order) =>
        order
          ? Promise.all(
              order.products.map((product_id) =>
                Product.findById(product_id).then((product) =>
                  product ? { ...product._doc } : null
                )
              )
            ).then((products) => ({
              ...order._doc,
              products,
            }))
          : null
      )
    )
  );
  res.send(orders);
});

app.patch("/api/add-to-wishlist/:id", protect, async (req, res) => {
  req.user.wishlist.push(req.params.id);
  await req.user.save();
  res.sendStatus(200);
});

app.patch("/api/remove-from-wishlist/:id", protect, async (req, res) => {
  req.user.wishlist = req.user.wishlist.filter(
    (id) => id.toString() !== req.params.id
  );
  await req.user.save();
  res.sendStatus(200);
});

app.patch("/api/add-to-cart/:id", protect, async (req, res) => {
  req.user.cart.push(req.params.id);
  await req.user.save();
  res.sendStatus(201);
});

app.patch("/api/remove-from-cart/:id", protect, async (req, res) => {
  req.user.cart = req.user.cart.filter((id) => id.toString() !== req.params.id);
  await req.user.save();
  res.sendStatus(201);
});

app.post("/api/place-order", protect, async (req, res) => {
  const order = await Order.create({
    user: req.user._id,
    products: req.user.cart,
  });
  req.user.orders.push(order._id);
  req.user.cart = [];
  await req.user.save();
  res.sendStatus(201);
});

async function protect2(req, res, next) {
  if (req.headers?.authorization?.startsWith("Bearer")) {
    try {
      let token = req.headers?.authorization.split(" ")[1];
      if (!token) {
        return res.sendStatus(401);
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.id).select("-password");
      if (!req.admin) {
        return res.sendStatus(401);
      }
      return next();
    } catch (err) {
      res.status(401);
    }
  } else {
    res.send(401);
  }
}

app.post("/api/admin/add-new", protect2, async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    throw new Error("400: MissingData, Missing Data!");
  }
  if (await Admin.findOne({ email })) {
    throw new Error("400: AdminAlreadyExists, Admin Already Exists!");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const admin = await Admin.create({
    name,
    email,
    password: hashedPassword,
  });
  res.status(201).json({
    ...admin.doc,
    password: undefined,
    token: generateToken(admin._id),
  });
});

app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Error("400: MissingData, Missing Data!");
  }
  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new Error("400: AdminNotFound, Admin Not Found!");
  }
  if (await bcrypt.compare(password, admin.password)) {
    res.json({
      ...admin._doc,
      password: undefined,
      token: generateToken(admin._id),
    });
  } else {
    res.status(401);
  }
});

app.post("/api/admin/add-product", protect2, async (req, res) => {
  res.send(await Product.create({ ...req.body }));
});

app.get("/api/admin/users", protect2, async (req, res) => {
  res.send(await User.find({}).select("-password"));
});

app.post("/api/admin/image", protect2, async (req, res) => {
  const image = await Image.create({
    data: req.body,
    ext: req.headers["content-type"].split("/")[1],
  });
  image.data = undefined;
  res.send(image);
});

app.delete("/api/admin/remove-product/:id", protect2, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    try {
      await Image.findByIdAndDelete(product.image._id);
    } catch {}
    await product.delete();
  }
  res.sendStatus(200);
});

app.get("/api/admin/orders", protect2, async (req, res) => {
  const result = await Order.find({}).then((orders) =>
    Promise.all(
      orders.map((order) =>
        Promise.all(
          order.products.map((product_id) =>
            Product.findById(product_id).then((product) => ({
              ...product._doc,
            }))
          )
        ).then((products) => {
          return User.findById(order.user)
            .select("-password")
            .then((user) => ({
              ...order._doc,
              user: {
                ...user._doc,
              },
              products,
            }));
        })
      )
    )
  );
  res.send(result);
});

app.get("/api/search/:query", async (req, res) => {
  const query = {};
  let name = [];
  const split = req.params.query.split(" ");
  for (const item of split) {
    const [key, value] = item.split(":");
    if (value) {
      if (key === "category") {
        const category = await Category.findOne({ name: value });
        if (!category) {
          continue;
        }
        query[key] = category._id;
        continue;
      }
      query[key] = value.replace(/_/g, " ");
    } else {
      name.push(key);
    }
  }
  name = name.join(" ").trim();
  if (name.length > 0) {
    query.name = { $regex: new RegExp(name, "i") };
  }
  res.send(await Product.find(query));
});

app.post("/api/add-rating", protect, async (req, res) => {
  const { product_id, rating, comment } = req.body;
  if (!product_id || rating === undefined || !comment) {
    throw new Error("400: MissingData, Missing Data!");
  }
  const product = await Product.findById(product_id);
  if (!product) {
    throw new Error("400: ProductNotFound, Product Not Found!");
  }
  product.rating =
    (product.rating * product.ratings.length + rating) /
    (product.ratings.length + 1);
  product.ratings.push({ user: req.user._id, comment, rating });
  await product.save();
  res.send({
    rating: product.rating,
    ratings: product.ratings,
  });
});

app.use("/", express.static("../client/public"));
app.use("**", express.static("../client/public/index.html"));

app.use((error, req, res, next) => {
  if (error) {
    if (
      error instanceof mongoose.Error.ValidationError ||
      error instanceof mongoose.Error.CastError
    ) {
      return res.status(400).send({
        ...error,
        message: error.message,
        name: error.name,
        stack: error.stack,
        web_msg: "Invalid Data!",
        error: true,
      });
    }
    if (error.message.startsWith("4") || error.message.startsWith("5")) {
      const regex = /([0-9]{3})\: (\w+), ([\w !]+)/;
      const [_, statusCode, message, web_msg] = regex.exec(error.message);
      return res.status(Number(statusCode)).send({
        ...error,
        message: message,
        name: error.name,
        stack: error.stack,
        web_msg,
        error: true,
      });
    }
    return res.status(500).send({
      ...error,
      message: message,
      name: error.name,
      stack: error.stack,
      web_msg: "Unexpected Server Error!",
      error: true,
    });
  }
});

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "60d" });
}

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected to DB");
  app.listen(process.env.PORT || 5000, () =>
    console.log("started at http://localhost:5000")
  );
});
