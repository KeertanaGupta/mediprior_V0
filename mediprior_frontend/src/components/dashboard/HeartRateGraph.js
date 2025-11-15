// src/components/dashboard/HeartRateGraph.js
import React from 'react';
import { Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement, // Changed from LineElement
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register the components we need for Chart.js
ChartJS.register(
    CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
);

function HeartRateGraph({ metricsData }) { // Renamed prop to metricsData to avoid confusion
    // Filter for heart rate and prepare data for the last 7 entries
    const sortedMetrics = metricsData
        ? [...metricsData].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at))
        : [];
    const last7Metrics = sortedMetrics.slice(-7);

    const labels = last7Metrics.map(m => {
        const date = new Date(m.recorded_at);
        return date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., Mon, Tue
    });
    const dataPoints = last7Metrics.map(m => m.heart_rate_bpm);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Heart Rate (bpm)',
                data: dataPoints,
                backgroundColor: 'var(--accent-primary)', // Use accent color
                borderColor: 'var(--accent-primary)',
                borderWidth: 1,
                borderRadius: 5, // Rounded bars
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: false, // Title is in Card.Title
            },
            tooltip: {
                backgroundColor: 'var(--bg-secondary)',
                titleColor: 'var(--text-primary)',
                bodyColor: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y + ' bpm';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: 'var(--text-secondary)' },
                title: {
                    display: false,
                    text: 'Day',
                    color: 'var(--text-primary)'
                }
            },
            y: {
                beginAtZero: true,
                grid: { color: 'var(--border-color)' }, // Lighter grid lines
                ticks: { color: 'var(--text-secondary)' },
                title: {
                    display: false,
                    text: 'Heart Rate (bpm)',
                    color: 'var(--text-primary)'
                }
            },
        },
    };

    return (
        <Card className="theme-card h-100">
            <Card.Body>
                <Card.Title className="theme-title mb-4">Heart Rate (Last 7 Days)</Card.Title>
                <div style={{ height: '250px' }}> {/* Increased height for better chart display */}
                    {metricsData && metricsData.length > 0 && dataPoints.length > 0 ? (
                        <Bar options={options} data={data} />
                    ) : (
                        <p className="text-muted text-center mt-5">No heart rate data available yet.</p>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
}

export default HeartRateGraph;