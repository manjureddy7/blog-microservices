const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 4003;

const COMMENT_MODERATION_TEXT = 'orange';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post('/events', async (req, res) => {
    const event = req.body;
    const { type, data } = event;
    if(type === 'COMMENT_CREATED') {
        const status = data.content.includes(COMMENT_MODERATION_TEXT) ? 'rejected' : 'approved';
        const eventBusService = process.env.EVENT_BUS_SERVICE || 'http://localhost:4005';
        await axios.post(`${eventBusService}/events`, {
            type: 'COMMENT_MODERATED',
            data: {
                ...data,
                status
            }
        });
        // await axios.post('http://localhost:4005/events', {
        //     type: 'COMMENT_MODERATED',
        //     data: {
        //         ...data,
        //         status
        //     }
        // })
    }
    res.send({});
});

app.listen(PORT, () => console.log(`Moderation app up & running!! on ${PORT}` ))