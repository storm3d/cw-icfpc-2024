function findPath(gridString) {
    const grid = gridString.split('\n');
    const rows = grid.length;
    const cols = grid[0].length;
    const directions = [
        { dx: -1, dy: 0, move: 'U' },
        { dx: 1, dy: 0, move: 'D' },
        { dx: 0, dy: -1, move: 'L' },
        { dx: 0, dy: 1, move: 'R' }
    ];
    let start;

    const matrix = grid.map(row => row.split(''));

    // Locate the starting position of Lambda-Man
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (matrix[i][j] === 'L') {
                start = { x: i, y: j };
                matrix[i][j] = '.'; // Convert start position to a pill for uniformity
            }
        }
    }

    // Helper function to perform A* and return the shortest path to a target position
    function aStar(startX, startY, targetX, targetY) {
        const pq = [[startX, startY, "", 0]]; // [x, y, path, cost]
        const visited = new Array(rows).fill(null).map(() => new Array(cols).fill(false));
        visited[startX][startY] = true;

        function heuristic(x, y) {
            return Math.abs(x - targetX) + Math.abs(y - targetY);
        }

        while (pq.length > 0) {
            pq.sort((a, b) => (a[3] + heuristic(a[0], a[1])) - (b[3] + heuristic(b[0], b[1])));
            const [x, y, currPath, cost] = pq.shift();

            if (x === targetX && y === targetY) {
                return currPath;
            }

            for (const { dx, dy, move } of directions) {
                const nx = x + dx;
                const ny = y + dy;

                if (nx >= 0 && ny >= 0 && nx < rows && ny < cols && !visited[nx][ny] && matrix[nx][ny] !== '#') {
                    visited[nx][ny] = true;
                    pq.push([nx, ny, currPath + move, cost + 1]);
                }
            }
        }
        return null;
    }

    // Collect all pill coordinates
    const pills = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (matrix[i][j] === '.') {
                pills.push({ x: i, y: j });
            }
        }
    }

    let currentPos = start;
    let path = "";

    // Collect all pills by always going to the nearest pill
    while (pills.length > 0) {
        let nearestPill = null;
        let shortestPath = null;

        for (let i = 0; i < pills.length; i++) {
            const pill = pills[i];
            const p = aStar(currentPos.x, currentPos.y, pill.x, pill.y);
            if (shortestPath === null || (p !== null && p.length < shortestPath.length)) {
                shortestPath = p;
                nearestPill = pill;
            }
        }

        if (shortestPath === null) {
            // If we can't find a path to any pill, something is wrong
            break;
        }

        path += shortestPath;
        console.log(path.length);
        currentPos = nearestPill;

        // Remove the collected pill
        pills.splice(pills.indexOf(nearestPill), 1);
    }

    return path;
}

// Example grid as a single string
//const gridString = "......\n.#....\n..#...\n...#..\n..#L#.\n.#...#\n......";

//console.log(findPath(gridString));



module.exports = findPath;