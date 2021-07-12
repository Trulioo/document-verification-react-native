import piexif from 'piexifjs';
import {Platform, PermissionsAndroid} from 'react-native';
import AcuantCaptureIOS from './AcuantCaptureIOS';
import AcuantCaptureAndroid from './AcuantCaptureAndroid';
import Geolocation from 'react-native-geolocation-service';

const androidVersion = 'AcuantAndroidV11.4.12';
const iosVersion = 'AcuantIOSV11.4.9';
const document = 'DOCUMENT';
const barcode = 'BARCODE';
const passport = 'PASSPORT';
const selfie = 'SELFIE';

var isInited = false;
var captureMode = '';
var isAuto = true;

const getAcuantController = () => {
  if (Platform.OS === 'ios') {
    return AcuantCaptureIOS;
  } else if (Platform.OS === 'android') {
    return AcuantCaptureAndroid;
  }
  return null;
};

const requestLocationPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Enable Geolocation',
          message: 'Enable Geolocation For Image Encoding',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    }
  } catch (err) {
    console.error(err);
    return false;
  }
};

const getLocation = async () => {
  const granted = await requestLocationPermission();
  if (granted) {
    return new Promise((resolve) => {
      const returnPosition = (position) => {
        resolve(position);
      };
      const errorHandle = (error) => {
        console.error(error);
        resolve(null);
      };
      Geolocation.getCurrentPosition(returnPosition, errorHandle, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      });
    });
  }
  return null;
};

const getMessage = async (imageData) => {
  var date = new Date();
  var platform = 'UNKNOWN REACTNATIVE';
  var captureSDK = '';
  if (Platform.OS === 'ios') {
    platform = 'IOS REACTNATIVE';
    captureSDK = iosVersion;
  } else if (Platform.OS === 'android') {
    platform = 'ANDROID REACTNATIVE';
    captureSDK = androidVersion;
  }

  var ipAddress = 'UNAVAILABLE';

  try {
    var response = await fetch(
      'https://api.globaldatacompany.com/common/v1/ip-info',
    );
    var responseJSON = await response.json();
    if (response.status === 200 && responseJSON.ipAddress) {
      ipAddress = responseJSON.ipAddress;
    }
  } catch (error) {
    console.warn(error);
  }

  const message = {
    V: '1',
    MODE: isAuto || captureMode === selfie ? 'AUTO' : 'MANUAL',
    SYSTEM: platform,
    CAPTURESDK: captureSDK,
    TRULIOOSDK: captureMode,
    TIMESTAMP: date.toJSON(),
    IPADDRESS: ipAddress,
    GPSLATITUDE: '',
    GPSLONGITUDE: '',
    ACUANTHORIZONTALRESOLUTION: imageData.dpi || '',
    ACUANTVERTICALRESOLUTION: imageData.dpi || '',
    ACUANTSHARPNESSMETRIC: imageData.sharpness || '',
    ACUANTGLAREMETRIC: imageData.glare || '',
  };

  try {
    const position = await getLocation();
    if (position) {
      message.GPSLATITUDE = position.coords.latitude;
      message.GPSLONGITUDE = position.coords.longitude;
    }
  } catch (error) {
    console.warn('Error getting location', error);
  }

  return JSON.stringify(message);
};

const encodeMessage = async (imageData) => {
  try {
    var exifObj = piexif.load(imageData.image);

    const msg = await getMessage(imageData);

    const zeroth = {};
    zeroth[piexif.ImageIFD.Software] = msg;
    exifObj = {'0th': zeroth};
    const exifbytes = piexif.dump(exifObj);
    const encodedImg = piexif.insert(exifbytes, imageData.image);
    return encodedImg;
  } catch (error) {
    console.warn(error);
    return imageData;
  }
};

const initModuleProxy = async (command) => {
  await module.exports.InitAcuantSDK();
  const result = await command();
  if (result) {
    var parsedResult = JSON.parse(result);
    const encodeImage = await encodeMessage(parsedResult);
    parsedResult.image = encodeImage;
    return parsedResult;
  }
  throw 'Unable to process capture';
};

module.exports = {
  InitAcuantSDK: async () => {
    if (!isInited) {
      try {
        const controller = getAcuantController();
        const result = await controller.InitSDK();
        if (result === 'SUCCESS') {
          isInited = true;
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error('Error in Init: ', error);
        throw error;
      }
    }
    return true;
  },
  ToggleCropping: async (cropEnabled) => {
    try {
      const controller = getAcuantController();
      await controller.SetCropEnabled(cropEnabled);
      return true;
    } catch (error) {
      console.warn(
        '[AcuantCaptureReactNative] Error encountered when toggling cropping:',
        error,
      );
      return false;
    }
  },
  ToggleAutoCapture: async (AutoCaptureEnabled) => {
    try {
      const controller = getAcuantController();
      await controller.SetAutoCaptureEnabled(AutoCaptureEnabled);
      isAuto = AutoCaptureEnabled;
      return true;
    } catch (error) {
      console.warn(
        '[AcuantCaptureReactNative] Error encountered when toggling auto capture:',
        error,
      );
      return false;
    }
  },
  StartDocumentCapture: async () => {
    captureMode = document;
    try {
      const controller = getAcuantController();
      return initModuleProxy(controller.StartDocumentCapture);
    } catch (error) {
      throw error;
    }
  },
  StartPassportCapture: async () => {
    captureMode = passport;
    try {
      const controller = getAcuantController();
      return initModuleProxy(controller.StartPassportCapture);
    } catch (error) {
      throw error;
    }
  },
  StartBarcodeCapture: async () => {
    captureMode = barcode;
    try {
      const controller = getAcuantController();
      return initModuleProxy(controller.StartBarcodeCapture);
    } catch (error) {
      throw error;
    }
  },
  StartSelfieCapture: async () => {
    captureMode = selfie;
    try {
      const controller = getAcuantController();
      return initModuleProxy(controller.StartSelfieCapture);
    } catch (error) {
      throw error;
    }
  },
};
