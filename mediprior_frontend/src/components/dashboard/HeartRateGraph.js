// src/components/dashboard/HeartRateGraph.js
import React from 'react';
import { Card } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { useTheme } from '../../context/ThemeContext'; // <-- 1. IMPORT THE THEME HOOK

// Register all required components for the chart
ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

function HeartRateGraph({ metrics }) {
    const { theme } = useTheme(); // <-- 2. GET THE CURRENT THEME

    // --- 3. SET COLORS BASED ON THE THEME ---
    const lineColor = theme === 'light' ? '#4E4E4E' : '#FFFFFF'; // Black or White
    const gridColor = theme === 'light' ? '#6c757d' : '#a0a6c0';
    const gridBorderColor = theme === 'light' ? '#e8e8e4' : '#363a59';
    // We'll keep the accent color for the area fill
    const areaColor = theme === 'light' ? 'rgba(254, 200, 154, 0.2)' : 'rgba(58, 123, 255, 0.2)';

    // Static data for now
    const data = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Heart Rate',
                data: [65, 68, 70, 66, 72, 71, 69],
                fill: true,
                backgroundColor: areaColor,
                borderColor: lineColor, // <-- 4. APPLY THEME COLOR
                pointBackgroundColor: lineColor,
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: gridColor } // <-- 5. APPLY THEME COLOR
            },
            y: {
                grid: { color: gridBorderColor }, // <-- 6. APPLY THEME COLOR
                ticks: { color: gridColor }
            },
        },
    };

    return (
        <Card className="theme-card h-100">
            <Card.Body>
                <Card.Title className="theme-title">Heart Rate (Last 7 Days)</Card.Title>
                <div style={{ height: '200px' }}>
                    <Line options={options} data={data} />
                </div>
            </Card.Body>
        </Card>
    );
}

export default HeartRateGraph;