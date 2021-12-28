const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');


const app = express();

const PORT = 4001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const commentsByPostId = {};

app.get('/all/posts/:id/comments', (req, res) => {
    const postID = req.params.id;
    const comments = commentsByPostId[postID] || [];
    res.send(comments);
});

app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex');
    const postId = req.params.id;
    const { content } = req.body;
    const comments = commentsByPostId[postId] || [];
    comments.push({ id: commentId, content, status: 'pending'});
    commentsByPostId[postId] = comments;
    // send an event to event-bus
    const event = {
        type: 'COMMENT_CREATED',
        data: {
            id: commentId, 
            content, 
            postId,
            status: 'pending'
        }
    }
    const eventBusService = process.env.EVENT_BUS_SERVICE || 'http://localhost:4005';
    await axios.post(`${eventBusService}/events`, event);
    res.status(201).send(`Comment ${commentId} successfully added`);
});

app.post('/events', async (req, res) => {
    const event = req.body;
    const { type, data } = event;
    const { postId, status, id, content } = data;
    if(type === 'COMMENT_MODERATED') {
        const comments = commentsByPostId[postId];
        const comment = comments.find(comment => comment.id === id);
        comment.status = status;
        const updatedEvent = {
            type: "COMMENT_UPDATED",
            data: {
                id,
                status,
                postId,
                content
            }
        }
        const eventBusService = process.env.EVENT_BUS_SERVICE || 'http://localhost:4005';
        await axios.post(`${eventBusService}/events`, updatedEvent);
    };
    res.send({});
    
});


app.listen(PORT, () => console.log(`Comments app up & running!! on ${PORT}` ))