export function createMockCanvas() {
    const ctx = {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        globalAlpha: 1,
        font: '',
        textAlign: '',
        shadowBlur: 0,
        shadowColor: '',
        beginPath: () => {},
        closePath: () => {},
        arc: () => {},
        rect: () => {},
        fill: () => {},
        stroke: () => {},
        fillRect: () => {},
        clearRect: () => {},
        fillText: () => {},
        strokeText: () => {},
        measureText: (text) => ({ width: text.length * 8 }),
        save: () => {},
        restore: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        drawImage: () => {},
        createLinearGradient: () => ({
            addColorStop: () => {}
        }),
        setTransform: () => {},
        moveTo: () => {},
        lineTo: () => {},
    };
    return { ctx, canvas: { width: 1600, height: 900 } };
}
