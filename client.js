const { Client } = require('pg');

const client = new Client({
    user: 'shah_fahad',
    host: 'localhost',
    database: 'chat_app',
    password: '',
    port: 5432,
});

client.connect().then(
    () => console.log('Connected to PostgreSQL')
).catch(
    err => console.log('Error connecting to PostgreSQL', err.stack,),
);

module.exports = client;