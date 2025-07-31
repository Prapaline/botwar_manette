const express = require('express');
const cors = require('cors');
console.log('Server is starting...');

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'X-Game-State']
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/action', (req, res) => {
    const rawGameState = req.headers['x-game-state'];

    if (!rawGameState) {
        console.log('ℹ️ X-Game-State header missing. Assuming a connection test.');
        return res.status(200).json({ message: 'Connection successful (no game state provided).' });
    }

    let gameState;
    try {
        gameState = JSON.parse(rawGameState);
    } catch (e) {
        console.error('Invalid GameState JSON:', e.message);
        return res.status(400).json({ error: 'GameState invalide (JSON).' });
    }

    console.log('Reçu GameState :', gameState);

    const botX = gameState.you.x;
    const botY = gameState.you.y;
    const points = gameState.points;
    const bombs = gameState.grid.flatMap((row, y) =>
        row.map((cell, x) => ({ x, y, hasBomb: cell.bombs && cell.bombs.length > 0 }))
    ).filter(cell => cell.hasBomb);

    let bestMove = 'STAY';
    let action = 'COLLECT';

    const isOnPoint = points.some(p => p.x === botX && p.y === botY);
    if (isOnPoint) {
        return res.json({ move: bestMove, action: action });
    }

    let closestPoint = null;
    let minDistance = Infinity;

    for (const point of points) {
        const isPointOnBomb = bombs.some(b => b.x === point.x && b.y === point.y);
        if (isPointOnBomb) {
            continue;
        }

        const distance = Math.abs(point.x - botX) + Math.abs(point.y - botY);
        if (distance < minDistance) {
            closestPoint = point;
            minDistance = distance;
        }
    }

    if (closestPoint) {
        let targetX = closestPoint.x;
        let targetY = closestPoint.y;

        if (botX < targetX) {
            if (!bombs.some(b => b.x === botX + 1 && b.y === botY)) {
                bestMove = 'RIGHT';
            } else if (botY < targetY) {
                if (!bombs.some(b => b.x === botX && b.y === botY + 1)) {
                    bestMove = 'DOWN';
                }
            } else if (botY > targetY) {
                if (!bombs.some(b => b.x === botX && b.y === botY - 1)) {
                    bestMove = 'UP';
                }
            }
        } else if (botX > targetX) {
            if (!bombs.some(b => b.x === botX - 1 && b.y === botY)) {
                bestMove = 'LEFT';
            } else if (botY < targetY) {
                if (!bombs.some(b => b.x === botX && b.y === botY + 1)) {
                    bestMove = 'DOWN';
                }
            } else if (botY > targetY) {
                if (!bombs.some(b => b.x === botX && b.y === botY - 1)) {
                    bestMove = 'UP';
                }
            }
        } else if (botY < targetY) {
            if (!bombs.some(b => b.x === botX && b.y === botY + 1)) {
                bestMove = 'DOWN';
            } else if (botX < targetX) {
                if (!bombs.some(b => b.x === botX + 1 && b.y === botY)) {
                    bestMove = 'RIGHT';
                }
            } else if (botX > targetX) {
                if (!bombs.some(b => b.x === botX - 1 && b.y === botY)) {
                    bestMove = 'LEFT';
                }
            }
        } else if (botY > targetY) {
            if (!bombs.some(b => b.x === botX && b.y === botY - 1)) {
                bestMove = 'UP';
            } else if (botX < targetX) {
                if (!bombs.some(b => b.x === botX + 1 && b.y === botY)) {
                    bestMove = 'RIGHT';
                }
            } else if (botX > targetX) {
                if (!bombs.some(b => b.x === botX - 1 && b.y === botY)) {
                    bestMove = 'LEFT';
                }
            }
        }
    }

    res.json({
        move: bestMove,
        action: action
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});