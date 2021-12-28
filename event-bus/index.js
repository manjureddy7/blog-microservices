const express = require('express');
const axios = require('axios');


const app = express();

const PORT = 4005;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const events = [];

app.post('/events', (req,res) => {
    const event = req.body;
    console.log('event received', event)
    events.push(event);
    const postsService = process.env.POSTS_SERVICE || 'http://localhost:4000';
    const commentsService = process.env.COMMENTS_SERVICE || 'http://localhost:4001';
    const queryService = process.env.QUERY_SERVICE || 'http://localhost:4002';
    const moderationService = process.env.MODERATION_SERVICE || 'http://localhost:4003';

    axios.post(`${postsService}/events`, event).catch(err => console.log('err from posts')); //posts
    axios.post(`${commentsService}/events`, event).catch(err => console.log('err from comments')); // comments
    axios.post(`${queryService}/events`, event).catch(err => console.log('err from query')); // query
    axios.post(`${moderationService}/events`, event).catch(err => console.log("err from moderation")); // moderation

    res.send('Event pusblished to all services')
});


app.get('/events', (req,res) => {
    res.send(events);
});



app.listen(PORT, () => console.log(`Event-Bus up & running!! on ${PORT}` ))