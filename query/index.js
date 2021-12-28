const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 4002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const posts = {};

const handleEvent = (type,data) => {

    if(type === 'POST_CREATED') {
        const { id, title } = data;
        posts[id] = {
            id,
            title,
            comments: []
        }
    }
    if(type === 'COMMENT_CREATED') {
        const { id, content, postId, status } = data;
        errorMessage = posts[postId] ? undefined : 'Post not found!';
        const post = posts[postId];
        if(post) {
            post.comments.push({ id, content, status })
        }
    }
    if(type === 'COMMENT_UPDATED') {
        const { id, content, postId, status } = data;
        errorMessage = posts[postId] ? undefined : 'Post not found!';
        const post = posts[postId];
        if(post) {
            const comment = post.comments.find(comment => comment.id === id);
            comment.status = status;
            comment.content = content;
        }
    }

}


app.post('/events', (req, res) => {
    const event = req.body;
    let errorMessage = '';
    const { type, data } = event;
    handleEvent(type, data)
    if(errorMessage) {
        res.status(400).send({message: errorMessage});
        return;
    }
    console.log('final posts', posts);
    res.send({});
});

app.get('/posts', (req,res) => {
    res.send(posts);
})



app.listen(PORT, async () => {
    // This is basically a check to see when our QUERY_SERVICE is down, what are all the events
    // that are emitted during that time
    const eventBusService = process.env.EVENT_BUS_SERVICE || 'http://localhost:4005';
    const res = await await axios.get(`${eventBusService}/events`);
    for(let event of res.data) {
        console.log('PROCESSING EVENT', event.type);
        handleEvent(event.type, event.data)
    }
})