const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/action', (req, res) => {
    const action = req.query.action || 'COLLECT';
    const move = req.query.move || 'STAY';
    const bombType = req.query.bombType;

    const response = { move, action };
    if (action === 'BOMB' && bombType) {
        response.bombType = bombType;
    }

    console.log(' Action envoyée au front :', response);
    res.json(response);
});

app.listen(port, () => {
    console.log(`✅ Backend API running at http://localhost:${port}`);
});
