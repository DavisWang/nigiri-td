const TOWER_IDS = ['cat', 'tanuki', 'penguin', 'fox', 'monkey', 'owl', 'octopus', 'shiba', 'bear', 'dragon'];
const NIGIRI_IDS = ['tamago', 'salmon', 'squid', 'shrimp', 'tuna', 'mackerel', 'scallop', 'ikura', 'uni', 'wagyu'];

const sprites = {};
let loaded = false;

function removeWhiteBackground(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = data.data;
    const threshold = 235;
    for (let i = 0; i < px.length; i += 4) {
        if (px[i] > threshold && px[i + 1] > threshold && px[i + 2] > threshold) {
            px[i + 3] = 0;
        }
    }
    ctx.putImageData(data, 0, 0);
    return canvas;
}

function loadImage(src, processBackground = true) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(processBackground ? removeWhiteBackground(img) : img);
        img.onerror = () => {
            console.warn(`Failed to load sprite: ${src}`);
            resolve(null);
        };
        img.src = src;
    });
}

export async function loadAllSprites() {
    const promises = [];

    for (const id of TOWER_IDS) {
        promises.push(loadImage(`assets/${id}-idle.png`, false).then(c => { sprites[`${id}-idle`] = c; }));
        promises.push(loadImage(`assets/${id}-attack.png`, false).then(c => { sprites[`${id}-attack`] = c; }));
    }

    for (const id of NIGIRI_IDS) {
        promises.push(loadImage(`assets/nigiri-${id}.png`, false).then(c => { sprites[`nigiri-${id}`] = c; }));
    }

    await Promise.all(promises);
    loaded = true;
}

export function getSprite(key) {
    return sprites[key] || null;
}

export function isLoaded() {
    return loaded;
}
