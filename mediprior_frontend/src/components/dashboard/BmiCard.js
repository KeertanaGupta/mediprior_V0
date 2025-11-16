// src/components/dashboard/BmiCard.js
import React from 'react';
import { Card } from 'react-bootstrap';
import GaugeChart from 'react-gauge-chart'; // <-- 1. Import the new library
import { useTheme } from '../../context/ThemeContext'; // Import theme hook

function BmiCard({ profile }) {
    const { theme } = useTheme(); // Get current theme
    
    let bmi = 0;
    let bmiCategory = 'N/A';
    let percent = 0; // The needle position (0.0 to 1.0)
    let categoryColor = 'var(--text-secondary)';

    // BMI Calculation
    if (profile && profile.height && profile.weight) {
        const heightInMeters = profile.height / 100;
        if (heightInMeters > 0) {
            bmi = (profile.weight / (heightInMeters * heightInMeters));
        }
    }

    // --- 2. Calculate Needle Position ---
    // We map the BMI range (e.g., 15 to 40) to a percentage (0 to 1)
    const minBmi = 15;
    const maxBmi = 40;
    percent = (bmi - minBmi) / (maxBmi - minBmi);
    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;

    // Set text and color
    if (bmi === 0) {
        bmi = 'N/A';
        bmiCategory = 'Please complete profile';
        percent = 0;
        categoryColor = 'var(--text-secondary)';
    } else if (bmi < 18.5) { bmiCategory = 'Underweight'; categoryColor = '#3a7bff'; }
    else if (bmi < 24.9) { bmiCategory = 'Normal'; categoryColor = '#1ee0ac'; }
    else if (bmi < 29.9) { bmiCategory = 'Overweight'; categoryColor = '#ffc107'; }
    else if (bmi < 34.9) { bmiCategory = 'Obese'; categoryColor = '#fd7e14'; }
    else { bmiCategory = 'Extremely Obese'; categoryColor = '#e63946'; }

    return (
        <Card className="theme-card h-100 text-center">
            <Card.Body>
                <Card.Title className="theme-title mb-0">Your BMI</Card.Title>
                
                {/* --- 3. The Gauge Chart --- */}
                <GaugeChart 
                    id="bmi-gauge"
                    nrOfLevels={5} // The 5 categories
                    arcsLength={[0.14, 0.26, 0.2, 0.2, 0.2]} // The % width of each color
                    colors={['#3a7bff', '#1ee0ac', '#ffc107', '#fd7e14', '#e63946']}
                    percent={percent} // The needle's position
                    needleBaseColor={theme === 'light' ? '#333333' : '#ffffff'}
                    needleColor={theme === 'light' ? '#333333' : '#ffffff'}
                    textColor="transparent" // Hide the default % text
                    hideText={true}
                    style={{width: '100%'}} // Make it responsive
                />
                
                {/* --- 4. Our Custom Text --- */}
                <h2 className="theme-title mb-1" style={{ fontSize: '2.5rem', marginTop: '-40px' }}>
                    {bmi === 'N/A' ? 'N/A' : bmi.toFixed(1)}
                </h2>
                <strong style={{ color: categoryColor }}>
                    {bmiCategory}
                </strong>
            </Card.Body>
        </Card>
    );
}

export default BmiCard;