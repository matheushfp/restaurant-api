# Restaurant API

This project was made using:<br>
[Express](https://expressjs.com/): One of the most famous frameworks in Node development environment, widely used, easy to handle middlewares, routes, etc.<br>
[MongoDB](https://www.mongodb.com/): Database with documents similar to JSON objects. As a NoSQL database has a advantage compared to SQL databases, flexibility.
In NoSQL databases modify the structure of already stored objects is possible and easy.<br>
[Mongoose](https://mongoosejs.com/): ODM made to facilitate MongoDB database manipulation inside Node, with good documentation and simple learning curve.<br>
[Zod](https://zod.dev/): TypeScript-first schema validation library, powerful but at the same time easy to use for data validation and even data transformation.<br>
[bcrypt.js](https://www.npmjs.com/package/bcryptjs): Library to hash passwords and store them more safely in the database.<br>
[JWT](https://jwt.io/): Token used for Authentication in protected routes, implemented via [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) library.<br>

## Quick Start

Note: To run this project you'll need MongoDB installed or a docker container with MongoDB running at the default port (27017)

1. Install the dependencies<br>
   With yarn: `yarn install`
   or
   with npm: `npm install`

2. Create a `.env` file in the root folder containing the secret for JWT <br>

```env
SECRET="YOUR_SECRET_HERE"
```

3. Applying seed to the database:<br>
   `yarn seed` or `npm run seed`

Note: This step will insert one user to test the API and data in categories and products.<br>
To access all routes, you'll need to login as admin at /auth/login to generate a JWT

```json
{
  "email": "admin@mail.com",
  "password": "root"
}
```

4. Run the project using `yarn dev` or `npm run dev` and the server will run at port 3000.

Note: Header Authorization needed in protected routes:<br>
`Authorization       Bearer JWT_HERE`
