const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const posts = {};

app.get('/all/posts', (req, res) => {
    res.send(posts);
});

app.post('/posts/create', async(req, res) => {
    const id = randomBytes(4).toString('hex'); // Generates a random string 'sf723532ghsf'
    const { title } = req.body;
    posts[id] = {
        id,
        title
    };
    // send an event to event-bus
    const event = {
        type: 'POST_CREATED',
        data: {
            id, title
        }
    }
    const eventBusService = process.env.EVENT_BUS_SERVICE || 'http://localhost:4005';
    await axios.post(`${eventBusService}/events`, event);
    res.status(201).send(`Post ${id} successfully created`);
});

app.get('/check-env', (req,res) => {
    console.log('process.env', process.env)
    res.send({
        eventBusService: process.env.EVENT_BUS_SERVICE || 'http://localhost:4005',
    })
})

app.post('/events', (req, res) => {
    res.send('ok')
});


app.listen(PORT, () => console.log(`Posts service is up & running!! on ${PORT}!!!` ))