const BACKGROUND = "#191b28";
const FOREGROUND = "#8288ce";

arena.width = 800;
arena.height = 800;

const ctx = arena.getContext("2d");
console.log(ctx);

function clear() { // clear
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, arena.width, arena.height);
}

function point({ x, y }) {
    const size = 15;

    ctx.fillStyle = FOREGROUND;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
}

function screen(p) {
    return { // converts generic coordinates to screen space points
        x: ((p.x + 1) / 2) * arena.width,
        y: (1 - (p.y + 1) / 2) * arena.height,
    };
}

function project({ x, y, z }) {
    const camera = 4; // camera position for perspective position
    return {
        x: x / (z + camera),
        y: y / (z + camera),
    };
}

const FPS = 60;
let dz = 0;
let angle = 0;

const vs = [
    { x: 0.5, y: 0.5, z: 0.5 },
    { x: -0.5, y: 0.5, z: 0.5 },
    { x: -0.5, y: -0.5, z: 0.5 },
    { x: 0.5, y: -0.5, z: 0.5 },

    { x: 0.5, y: 0.5, z: -0.5 },
    { x: -0.5, y: 0.5, z: -0.5 },
    { x: -0.5, y: -0.5, z: -0.5 },
    { x: 0.5, y: -0.5, z: -0.5 },
];

const fs = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
]; // connecting the pts

function translate_z({ x, y, z }) {
    return {
        x,
        y,
        z: z + dz,
    };
}

function line(p1, p2) {
    ctx.strokeStyle = FOREGROUND;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function frame() {
    const dt = 1 / FPS / 2;
    angle += 2 * Math.PI * dt;

    clear();

    for (const f of fs) {
        for (let i = 0; i < f.length; i++) {
            const a = vs[f[i]];
            const b = vs[f[(i + 1) % f.length]]; // wrap

            line(
                screen(project(translate_z(rotate(a, omega, angle)))),
                screen(project(translate_z(rotate(b, omega, angle)))),
            );
        }
    }

    setTimeout(frame, 1000 / FPS);
}

let omega = { x: 0.3, y: 0.789, z: 0.2}; // angular velocity vector

function rotate(vector, omega, dt) {
    const theta = Math.hypot(omega.x, omega.y, omega.z) * dt;
    if (theta === 0) return p;
    console.log(theta);

    const ux = omega.x / Math.hypot(omega.x, omega.y, omega.z); // calculating normalized omega val for each point
    const uy = omega.y / Math.hypot(omega.x, omega.y, omega.z);
    const uz = omega.z / Math.hypot(omega.x, omega.y, omega.z);

    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    return { // no idea what is this
        x:
            vector.x * cos +
            (uy * vector.z - uz * vector.y) * sin +
            ux * (ux * vector.x + uy * vector.y + uz * vector.z) * (1 - cos),

        y:
            vector.y * cos +
            (uz * vector.x - ux * vector.z) * sin +
            uy * (ux * vector.x + uy * vector.y + uz * vector.z) * (1 - cos),

        z:
            vector.z * cos +
            (ux * vector.y - uy * vector.x) * sin +
            uz * (ux * vector.x + uy * vector.y + uz * vector.z) * (1 - cos),
    };
}
setTimeout(frame, 1000 / FPS);
