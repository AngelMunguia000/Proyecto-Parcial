const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost:27017/oxxo-auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  cart: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      productName: String,
      productImage: String,
      price: Number,
      quantity: Number,
    }
  ],
});

const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).send('Usuario ya registrado');
    }

    const newUser = new User({ username, password, cart: [] });
    await newUser.save();
    res.status(200).send('Usuario registrado');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al registrar nuevo usuario');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }

    if (user.password !== password) {
      return res.status(401).send('Contraseña incorrecta');
    }

    res.status(200).send('Usuario autenticado');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al iniciar sesión');
  }
});

app.post('/cart/add', async (req, res) => {
  try {
    const { username, productId, productName, productImage, price, quantity } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }

    const itemIndex = user.cart.findIndex(item => item.productId && item.productId.equals(new mongoose.Types.ObjectId(productId)));

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity += quantity;
    } else {
      user.cart.push({ productId: new mongoose.Types.ObjectId(productId), productName, productImage, price, quantity });
    }

    await user.save();
    res.status(200).send('Producto añadido al carrito');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al añadir producto al carrito');
  }
});

app.get('/cart/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }

    res.status(200).json(user.cart);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener el carrito');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
