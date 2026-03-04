const canvas = document.getElementById('timelineCanvas');
const ctx = canvas.getContext('2d');
const form = document.getElementById('timelineForm');
const downloadBtn = document.getElementById('downloadPng');

// Set internal resolution for high quality
canvas.width = 1920;
canvas.height = 1080;

const COLORS = {
    blue: '#3498db',
    green: '#2ecc71',
    orange: '#e67e22',
    grid: '#ecf0f1',
    text: '#2c3e50',
    bg: '#ffffff'
};

const MARGIN = { top: 220, left: 200, right: 100, bottom: 100 };
const ROW_HEIGHT = 80;
const WEEK_WIDTH = 60; // Base width, will be scaled to fit

function render(data) {
    const { startDate, numDesigns, numPartners, numWarehouses } = data;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fill Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate Partner Phases
    const partnerPhases = [];
    const stagger = 2.5; // weeks
    const designDuration = 5; // weeks
    const testDuration = 0.5 * numPartners;

    for (let i = 0; i < numDesigns; i++) {
        const dStart = i * stagger;
        const dEnd = dStart + designDuration;
        const tStart = dEnd;
        const tEnd = tStart + testDuration;
        
        partnerPhases.push({
            label: `Workstream ${i + 1}`,
            design: { start: dStart, end: dEnd },
            testing: { start: tStart, end: tEnd },
            row: i
        });
    }

    // Calculate Secondary Phases (all on one row)
    const warehousePhases = [];
    const warehouseDuration = 6;
    const warehouseRow = numDesigns;
    
    for (let i = 0; i < numWarehouses; i++) {
        const wStart = i * warehouseDuration;
        const wEnd = wStart + warehouseDuration;
        warehousePhases.push({
            label: `Task ${i + 1}`,
            start: wStart,
            end: wEnd
        });
    }

    // Determine Total Weeks
    let maxWeeks = 0;
    partnerPhases.forEach(p => maxWeeks = Math.max(maxWeeks, p.testing.end));
    if (numWarehouses > 0) {
        maxWeeks = Math.max(maxWeeks, numWarehouses * warehouseDuration);
    }
    maxWeeks = Math.ceil(maxWeeks) + 1; // Add buffer

    // Scaling
    const availableWidth = canvas.width - MARGIN.left - MARGIN.right;
    const weekScale = availableWidth / maxWeeks;

    // Draw Grid and Timeline Labels
    drawGrid(maxWeeks, weekScale, startDate);

    // Draw Main Tracks
    partnerPhases.forEach(p => {
        const y = MARGIN.top + p.row * ROW_HEIGHT;
        
        // Phase 1 Bar
        drawBar(
            MARGIN.left + p.design.start * weekScale,
            y + 10,
            (p.design.end - p.design.start) * weekScale,
            ROW_HEIGHT - 20,
            COLORS.blue,
            `Phase 1`
        );

        // Phase 2 Bar
        drawBar(
            MARGIN.left + p.testing.start * weekScale,
            y + 10,
            (p.testing.end - p.testing.start) * weekScale,
            ROW_HEIGHT - 20,
            COLORS.green,
            `Phase 2`
        );

        // Row Label
        ctx.fillStyle = COLORS.text;
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "right";
        ctx.fillText(`Track ${p.row + 1}`, MARGIN.left - 20, y + ROW_HEIGHT/2 + 8);
    });

    // Draw Secondary Track
    if (numWarehouses > 0) {
        const y = MARGIN.top + warehouseRow * ROW_HEIGHT;
        
        warehousePhases.forEach((w, i) => {
            drawBar(
                MARGIN.left + w.start * weekScale,
                y + 10,
                (w.end - w.start) * weekScale,
                ROW_HEIGHT - 20,
                COLORS.orange,
                w.label
            );
        });

        ctx.fillStyle = COLORS.text;
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "right";
        ctx.fillText("Secondary", MARGIN.left - 20, y + ROW_HEIGHT/2 + 8);
    }

    // Title and Summary
    drawHeader(data, maxWeeks);
}

function drawGrid(weeks, scale, startDate) {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#888";

    // Dynamic step frequency to prevent label crowding
    let step = 1;
    if (weeks > 30) step = 2;
    if (weeks > 60) step = 4;
    if (weeks > 120) step = 8;
    if (weeks > 250) step = 12;

    for (let i = 0; i <= weeks; i += step) {
        const x = MARGIN.left + i * scale;
        
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(x, MARGIN.top - 20);
        ctx.lineTo(x, canvas.height - MARGIN.bottom);
        ctx.stroke();

        // Label
        let label = `W${i}`;
        if (startDate) {
            const date = new Date(startDate);
            // Fix: Add timezone offset to ensure the date matches the user's input
            const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
            localDate.setDate(localDate.getDate() + (i * 7));
            label = localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        ctx.fillText(label, x, MARGIN.top - 40);
    }
}

function drawBar(x, y, w, h, color, label) {
    ctx.fillStyle = color;
    // Rounded rect
    const r = 5;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    // Label inside bar if wide enough
    if (w > 50) {
        ctx.fillStyle = "white";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.fillText(label, x + w/2, y + h/2 + 6);
    }
}

function drawHeader(data, totalWeeks) {
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = "left";
    ctx.font = "bold 56px Arial";
    ctx.fillText("Project Timeline", MARGIN.left, 80);

    ctx.font = "24px Arial";
    ctx.fillStyle = "#555";
    const summary = `Inputs: ${data.numDesigns} Tracks | ${data.numPartners} Scale | ${data.numWarehouses} Secondary | Estimated Duration: ${totalWeeks} Weeks`;
    ctx.fillText(summary, MARGIN.left, 135);
}


function updateTimeline() {
    const formData = new FormData(form);
    const data = {
        startDate: formData.get('startDate'),
        numDesigns: parseInt(formData.get('numDesigns')) || 0,
        numPartners: parseInt(formData.get('numPartners')) || 0,
        numWarehouses: parseInt(formData.get('numWarehouses')) || 0
    };
    render(data);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    updateTimeline();
});

// Add listeners for automatic updates
form.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', updateTimeline);
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'timeline.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Initial Render
render({
    startDate: '',
    numDesigns: 4,
    numPartners: 10,
    numWarehouses: 2
});
