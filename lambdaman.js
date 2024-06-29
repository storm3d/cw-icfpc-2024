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

    // Helper function to perform BFS and return the shortest path to the nearest pill
    function bfs(startX, startY) {
        const queue = [[startX, startY, ""]];
        const visited = new Array(rows).fill(null).map(() => new Array(cols).fill(false));
        visited[startX][startY] = true;

        while (queue.length > 0) {
            const [x, y, currPath] = queue.shift();

            for (const { dx, dy, move } of directions) {
                const nx = x + dx;
                const ny = y + dy;

                if (nx >= 0 && ny >= 0 && nx < rows && ny < cols && !visited[nx][ny] && matrix[nx][ny] !== '#') {
                    visited[nx][ny] = true;
                    const newPath = currPath + move;

                    if (matrix[nx][ny] === '.') {
                        return { path: newPath, x: nx, y: ny };
                    }

                    queue.push([nx, ny, newPath]);
                }
            }
        }
        return null;
    }

    // Collect all pill coordinates
    let currentPos = start;
    let path = "";

    // Collect all pills by always going to the nearest pill
    while (true) {
        const result = bfs(currentPos.x, currentPos.y);
        if (!result) break;

        path += result.path;
        currentPos = { x: result.x, y: result.y };
        matrix[currentPos.x][currentPos.y] = ' '; // Mark pill as collected
    }

    return path;
}

// Example grid as a single string
const gridString = "......\n.#....\n..#...\n...#..\n..#L#.\n.#...#\n......";

//console.log(findPath(gridString));




module.exports = { findPath };