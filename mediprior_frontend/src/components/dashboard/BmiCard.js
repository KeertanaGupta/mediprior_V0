// src/components/dashboard/BmiCard.js
import React from 'react';
import { Card } from 'react-bootstrap';

function BmiCard({ profile }) {
    let bmi = 'N/A';
    let bmiCategory = 'Please complete profile';
    let categoryColor = 'var(--text-secondary)'; // Default neutral color

    if (profile && profile.height && profile.weight) {
        const heightInMeters = profile.height / 100; // Assuming height is in cm
        const weightInKg = profile.weight; // Assuming weight is in kg

        if (heightInMeters > 0 && weightInKg > 0) {
            bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);

            if (bmi < 18.5) {
                bmiCategory = 'Underweight';
                categoryColor = 'var(--accent-info)'; // Blue-ish
            } else if (bmi < 24.9) {
                bmiCategory = 'Normal Weight';
                categoryColor = 'var(--accent-success)'; // Green
            } else if (bmi < 29.9) {
                bmiCategory = 'Overweight';
                categoryColor = 'var(--accent-warning)'; // Yellow/Orange
            } else {
                bmiCategory = 'Obese';
                categoryColor = 'var(--accent-danger)'; // Red
            }
        } else {
            bmi = 'N/A';
            bmiCategory = 'Invalid data';
        }
    }

    return (
        <Card className="theme-card h-100 text-center d-flex flex-column justify-content-center">
            <Card.Body>
                <p className="mb-1" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your BMI</p>
                <h2 className="theme-title mb-2" style={{ fontSize: '2.8rem', fontWeight: 'bold' }}>{bmi}</h2>
                <span className="status-badge" style={{ backgroundColor: categoryColor + '30', color: categoryColor }}>
                    {bmiCategory}
                </span>
            </Card.Body>
        </Card>
    );
}

export default BmiCard;