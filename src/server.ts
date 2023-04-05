import express from 'express';
import { connect } from 'mongoose';
import { route } from './routes';

const app = express();
const port = 3000;

app.use(express.json());
app.use(route);

// Connecting in the Database
run().catch((err) => console.log(err));

async function run() {
  await connect('mongodb://127.0.0.1:27017/restaurantDB');
}

app.listen(port, () => {
  console.log(`Server running at port: ${port}`);
});
