import { connect, disconnect } from 'mongoose';
import { hash } from 'bcryptjs';
import User from '../models/User';
import Category from '../models/Category';
import Product from '../models/Product';

// Connecting in the Database
run().catch((err) => console.log(err));

async function run() {
  await connect('mongodb://127.0.0.1:27017/restaurantDB');
}

async function seed() {
  // Clear the database
  await User.collection.drop();
  await Category.collection.drop();
  await Product.collection.drop();

  /**
   * Create admin user
   */

  await Promise.resolve(
    await User.create({
      email: 'admin@mail.com',
      password: await hash('root', 10)
    })
  );

  /**
   * Create Categories
   */

  await Promise.all([
    await Category.create({
      name: 'Bebidas'
    }),

    await Category.create({
      name: 'Sucos',
      parent: await Category.findOne({ name: 'Bebidas' })
    }),

    await Category.create({
      name: 'Refrigerantes',
      parent: await Category.findOne({ name: 'Bebidas' })
    }),

    await Category.create({
      name: 'Comida Japonesa'
    }),

    await Category.create({
      name: 'Pizzas'
    }),

    await Category.create({
      name: 'Pizzas Doces',
      parent: await Category.findOne({ name: 'Pizzas' })
    }),

    await Category.create({
      name: 'Pizzas Salgadas',
      parent: await Category.findOne({ name: 'Pizzas' })
    })
  ]);

  /**
   * Create Products
   */

  await Promise.all([
    await Product.create({
      name: 'Água 350ML',
      qty: 1,
      price: 1.49,
      categories: [await Category.findOne({ name: 'Bebidas' })]
    }),

    await Product.create({
      name: 'Suco de Laranja (Jarra)',
      qty: 1,
      price: 14.99,
      categories: [
        await Category.findOne({ name: 'Sucos' }),
        await Category.findOne({ name: 'Bebidas' })
      ]
    }),

    await Product.create({
      name: 'Coca-Cola Lata 350ML',
      qty: 1,
      price: 5.49,
      categories: [
        await Category.findOne({ name: 'Refrigerantes' }),
        await Category.findOne({ name: 'Bebidas' })
      ]
    }),

    await Product.create({
      name: 'Fanta Laranja Lata 350ML',
      qty: 1,
      price: 3.99,
      categories: [
        await Category.findOne({ name: 'Refrigerantes' }),
        await Category.findOne({ name: 'Bebidas' })
      ]
    }),

    await Product.create({
      name: 'Temaki',
      qty: 8,
      price: 44.99,
      categories: [await Category.findOne({ name: 'Comida Japonesa' })]
    }),

    await Product.create({
      name: 'Sushi',
      qty: 12,
      price: 49.99,
      categories: [await Category.findOne({ name: 'Comida Japonesa' })]
    }),

    await Product.create({
      name: 'Pizza de Calabresa',
      qty: 1,
      price: 59.99,
      categories: [
        await Category.findOne({ name: 'Pizzas Salgadas' }),
        await Category.findOne({ name: 'Pizzas' })
      ]
    }),

    await Product.create({
      name: 'Pizza de Brigadeiro',
      qty: 1,
      price: 69.99,
      categories: [
        await Category.findOne({ name: 'Pizzas Doces' }),
        await Category.findOne({ name: 'Pizzas' })
      ]
    })
  ]);
}

seed()
  .then(async () => {
    await disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await disconnect();
    process.exit(1);
  });
