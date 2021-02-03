/**
 * Trulioo Sample React Native App
 */

import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  Image,
  Switch,
} from 'react-native';

import AcuantCapture from './AcuantCaptureReactNative';
import TruliooImage from './TruliooImage';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const App = () => {
  const [img, setImage] = useState({image: TruliooImage});
  const [shouldCrop, setShouldCrop] = useState(true);
  const [shouldAutoCapture, setShouldAutoCapture] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleCropping = async () => {
    AcuantCapture.ToggleCropping(!shouldCrop).then(
      (success) => success && setShouldCrop(!shouldCrop),
    );
  };

  const toggleAutoCapture = async () => {
    AcuantCapture.ToggleAutoCapture(!shouldAutoCapture).then(
      (success) => success && setShouldAutoCapture(!shouldAutoCapture),
    );
  };

  const startDocumentCapture = async () => {
    setIsProcessing(true);
    try {
      const result = await AcuantCapture.StartDocumentCapture();
      setImage(result);
    } catch (error) {
      console.warn(error);
    }
    setIsProcessing(false);
  };

  const startPassportCapture = async () => {
    setIsProcessing(true);
    try {
      const result = await AcuantCapture.StartPassportCapture();
      setImage(result);
    } catch (error) {
      console.warn(error);
    }
    setIsProcessing(false);
  };

  const startBarcodeCapture = async () => {
    setIsProcessing(true);
    try {
      const result = await AcuantCapture.StartBarcodeCapture();
      setImage(result);
    } catch (error) {
      console.warn(error);
    }
    setIsProcessing(false);
  };

  const startSelfieCapture = async () => {
    setIsProcessing(true);
    try {
      const result = await AcuantCapture.StartSelfieCapture();
      setImage(result);
    } catch (error) {
      console.warn(error);
    }
    setIsProcessing(false);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                Trulioo React Native Sample App
              </Text>
            </View>
            <View style={styles.button}>
              <Button
                onPress={startDocumentCapture}
                title="Start Document Capture"
              />
            </View>
            <View style={styles.button}>
              <Button
                onPress={startBarcodeCapture}
                title="Start Barcode Capture"
              />
            </View>
            <View style={styles.button}>
              <Button
                onPress={startPassportCapture}
                title="Start Passport Capture"
              />
            </View>
            <View style={styles.container}>
              <Text style={styles.label}>Crop Image</Text>
              <Switch
                style={styles.switch}
                trackColor={trackColor}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleCropping}
                value={shouldCrop}
              />
            </View>
            <View style={styles.container}>
              <Text style={styles.label}>Auto Capture</Text>
              <Switch
                style={styles.switch}
                trackColor={trackColor}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleAutoCapture}
                value={shouldAutoCapture}
              />
            </View>
            <View style={styles.button}>
              <Button
                onPress={startSelfieCapture}
                title="Start Selfie Capture"
              />
            </View>
            <View style={styles.imageBox}>
              <Text style={styles.sectionTitle}> Image Result</Text>
              <ImageQualityDisplay img={img} />
              <Image style={styles.img} source={{uri: img.image}} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      {isProcessing ? (
        <View style={styles.overlay} visible>
          <View style={styles.overlayTextContainer}>
            <Text style={styles.overlayText}>Processing...</Text>
          </View>
        </View>
      ) : null}
    </>
  );
};

const ImageQualityDisplay = ({img}) => {
  if (!img.sharpness) {
    return null;
  }
  const getWarning = (prop) => {
    switch (prop) {
      case 'sharpness':
        return `${img[prop]} ${img[prop] < 51 ? '- Image is blurry' : ''}`;
      case 'glare':
        return `${img[prop]} ${img[prop] < 51 ? '- Reduce glare' : ''}`;
      case 'dpi':
        return `${img[prop]} ${img[prop] < 300 ? '- Resolution too low' : ''}`;
    }
  };
  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.oddRow]}>
        <Text style={styles.cell}>Sharpness</Text>
        <Text style={styles.cell}>{getWarning('sharpness')}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.cell}>Glare</Text>
        <Text style={styles.cell}>{getWarning('glare')}</Text>
      </View>
      <View style={[styles.row, styles.oddRow]}>
        <Text style={styles.cell}>DPI</Text>
        <Text style={styles.cell}>{getWarning('dpi')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(176,224,230,0.8)',
  },
  overlayTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.black,
  },
  label: {
    margin: 5,
    alignSelf: 'center',
  },
  switch: {
    margin: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    margin: 10,
  },
  table: {
    borderColor: '#7ce2ff',
    borderWidth: 1,
    borderRadius: 5,
    width: 300,
    overflow: 'hidden',
    padding: 2,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  oddRow: {
    backgroundColor: '#e7faff',
  },
  cell: {
    flex: 1,
    margin: 3,
  },
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  body: {
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.black,
  },
  button: {
    margin: 5,
    padding: 5,
    backgroundColor: '#d6d6d6',
    borderRadius: 5,
    width: '70%',
  },
  imageBox: {
    alignItems: 'center',
  },
  img: {
    height: 300,
    width: 350,
    resizeMode: 'contain',
  },
});
const trackColor = {false: '#767577', true: '#81b0ff'};

export default App;
