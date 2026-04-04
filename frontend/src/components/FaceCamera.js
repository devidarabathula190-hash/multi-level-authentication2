import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function FaceCamera({ onFaceCaptured, onCancel, inline }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.text}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.3 });
        onFaceCaptured(photo);
      } catch (error) {
        Alert.alert("Error", "Could not take picture");
      }
    } else {
      Alert.alert("Wait", "Camera is not ready yet.");
    }
  };

  return (
    <View style={inline ? styles.inlineContainer : styles.container}>
      <CameraView 
        style={styles.camera} 
        ref={cameraRef}
        facing="front"
      />
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.faceFrame} />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.text}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.captureBtn} 
          onPress={takePicture}
        >
          <View style={styles.innerCircle} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  faceFrame: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: '#FFD700',
    borderRadius: 20,
    borderStyle: 'solid',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  cancelBtn: {
    padding: 15,
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
  },
  inlineContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 30,
    overflow: 'hidden',
  }
});

