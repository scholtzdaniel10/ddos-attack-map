#!/usr/bin/env python3
"""
Simple ML model trainer for threat classification
This is a basic implementation for demonstration purposes
"""

import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

def generate_training_data(n_samples=1000):
    """Generate synthetic training data for threat classification"""
    np.random.seed(42)
    
    # Features: packet_size, frequency, source_reputation, geographic_anomaly
    features = []
    labels = []
    
    for _ in range(n_samples):
        # Generate synthetic features
        packet_size = np.random.normal(500, 200)  # Normal packet size around 500
        frequency = np.random.exponential(50)     # Most traffic is low frequency
        source_reputation = np.random.beta(2, 5)  # Most IPs have low reputation
        geographic_anomaly = np.random.beta(1, 4) # Most traffic is not geographically anomalous
        
        # Create threat label based on features
        threat_score = (
            (packet_size > 1000) * 0.3 +      # Large packets
            (frequency > 100) * 0.4 +         # High frequency
            (source_reputation > 0.7) * 0.2 + # Known bad IP
            (geographic_anomaly > 0.5) * 0.1  # Geographic anomaly
        )
        
        # Add some noise
        threat_score += np.random.normal(0, 0.1)
        
        # Classify based on thresholds
        if threat_score > 0.7:
            label = 'high'
        elif threat_score > 0.4:
            label = 'medium'
        else:
            label = 'low'
        
        features.append([packet_size, frequency, source_reputation, geographic_anomaly])
        labels.append(label)
    
    return np.array(features), np.array(labels)

def train_model():
    """Train the threat classification model"""
    print("Generating training data...")
    X, y = generate_training_data(1000)
    
    print("Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("Training model...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        class_weight='balanced'
    )
    
    model.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Accuracy: {accuracy:.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save model
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, 'models')
    os.makedirs(model_path, exist_ok=True)
    
    model_file = os.path.join(model_path, 'threat_classifier.joblib')
    joblib.dump(model, model_file)
    
    # Save model metadata
    metadata = {
        'accuracy': accuracy,
        'feature_names': ['packet_size', 'frequency', 'source_reputation', 'geographic_anomaly'],
        'classes': model.classes_.tolist(),
        'model_type': 'RandomForestClassifier',
        'version': '1.0'
    }
    
    metadata_file = os.path.join(model_path, 'model_metadata.json')
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\nModel saved to: {model_file}")
    print(f"Metadata saved to: {metadata_file}")
    
    return model

if __name__ == "__main__":
    print("Starting ML model training...")
    model = train_model()
    print("Training completed successfully!")
