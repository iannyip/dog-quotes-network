# dog-quotes-network

A social network for dogs to spit inspiring quotes

## Features

- Users can log in and post an inspiring quote.
- Users can follow, unfollow other users as well.
- Implemented feed and profiles.
- If a particular quote is truly inspiring, you can choose to tip that user any dollar amount you deem fit.
- A digital wallet needs to be funded (Stripe payments) in order to give tips.
- App is mobile friendly as well.

## Technologies

- Frontend: HTML, CSS, Bootstrap, EJS
- Backend: PostgreSQL, Express
- Cool Integrations: Stripe Payments
- Version Control: Git

## Thoughts

- Implemented a feed - a hallmark of social media sites. Users needed to be able to scroll through an (endless) list of posts
- My first ever backend app. Initially deployed on AWS EC2.
- Key concepts: Serving EJS pages using Express; Inline SQL queries; User Auth & Encryption; Cookies; Mobile friendly
- Business focus: Stripe payment integration, as almost every business application needs to facilitate some form of payment.

## Development

First, setup and seed the DB in the terminal:

```
createdb -U <username> doggos
psql -d doggos -f init.sql
```

Verify that DB exists:

```
psql doggos
\dt
quit
```

Next, start the web application

```
npm install
npx nodemon index.js
```

The application can be found on http://localhost:3004/.
Create an account and login.

## Test account

Login with a test account:

1. Go to http://localhost:3004/test
2. Use the following credentials:

```
username: Yettie
password: nsMAC8cgG
```
